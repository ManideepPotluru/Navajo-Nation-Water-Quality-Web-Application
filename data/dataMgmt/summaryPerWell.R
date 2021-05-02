##---------------------------------------------------------------##
##Script for summary analysis of Navajo water quality data   ##
#Date: Feb 8, 2021                                           ##
##Contact: johoovermsubillings.edu                               ##

library(reshape2)
library(NADA)
library(plyr)
library(dplyr)
library(tidyr)

##Set working directory
setwd("C:/Users/dbeene/OneDrive - University of New Mexico/00_Haury/DB/forDaniel_Feb2021/00_data")

rm(list=ls())

#load analyte table and type
analyteType<-
  read.csv(file="./01_rawData/analyteType_andClassification.csv")

#Add in NN Wells and join data
wells<-
  read.csv("./01_rawData/w_water_sources.csv"
           , header=TRUE
           , na.strings = "NULL")

##Read .csv file with water quality data formatted for ROS and K-M Analysis  ##################
data<-
  read.csv("./01_rawData/water_analytesPublic_20210208.csv"
           , header=TRUE
           , na.strings = ""
           , stringsAsFactors = F)
summary(data$result)

data<-
  merge(
    data
  , analyteType
  , by="analyte")
summary(
  as.factor(data$analyte))
# data<-merge(data, wells[,c(4,22)], all.x=T)

#Create new temp data frame for summary stats
data.b<-data

##Create a new variable and record results for detection limit values##
# data$obs2<-NA
data.b$obs2<-as.numeric(data.b$result); summary(data.b$obs2)

##Convert from activity to mass. Assuming 0.67 pCi/ug
data.b$obs2[data.b$analyte=="U_Total"]<-
  as.numeric(
    data.b$result[data.b$analyte=="U_Total"])/0.67
summary(data.b$result)
summary(data.b$obs2)

data.b$obs2[data.b$analyte=="U" & data.b$unit=="pCi/L"]<-
  as.numeric(
    data.b$result[data.b$analyte=="U"& data.b$unit=="pCi/L"])/0.67
summary(data.b$result)
summary(data.b$obs2)

##Create new variable called result and assign it the obs values##
#data$result<-NA
data.b$result<-
  data.b$obs2
summary(data.b$result)
summary(data.b$obs2)

##Create new analyte variable and change U_Total to U
data.b$analyte2<-data.b$analyte
data.b$analyte2[data.b$analyte=="U_Total"]<-"U"
data.b$analyte<-data.b$analyte2

#Change data type
data.b$analyte<-as.character(data.b$analyte)
data.b$analyte<-as.factor(data.b$analyte)

#Rename to Data
data<-data.b

# Calculate summary stat for each analyte per well
sumStats_primaryMCL<-data %>%
  filter(Type == 'PrimaryStandard') %>%
  group_by(well_id, analyte2) %>%
  summarize(median = max(obs2))
colnames(sumStats_primaryMCL)[3]<-"result"
sumStats_primaryMCL$type<-"max"


sumStats_waterChem<-data %>%
  filter(Type == 'WaterChemistry') %>%
  group_by(well_id, analyte2) %>%
  summarize(median = median(obs2)) 
colnames(sumStats_waterChem)[3]<-"result"
sumStats_primaryMCL$type<-"median"

#Row bind Results and convert to wide format
abc<-rbind(sumStats_primaryMCL, sumStats_waterChem)

#Convert to wide format

abcW<-dcast(abc, well_id~analyte2, median, value.var="result")


write.csv(abcW, file="./02_postProcessed/20210214_wqDataPublic.csv")
