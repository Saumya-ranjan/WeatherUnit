import numpy as np 
import pandas as pd 
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn import datasets,linear_model
import matplotlib.pyplot as plt
import os

def city(targetdata,data):
  
  td=['T','PP','V','RA','FG']
  d=['python/weatherml/bangalore.csv','python/weatherml/mumbai.csv','python/weatherml/delhi.csv','python/weatherml/chennai.csv','python/weatherml/kolkata.csv']

  dfcity=pd.read_csv(d[data-1],header=0,na_values=['-'])
  dfcity.set_index('Year',inplace=True)
  dfcity=dfcity.loc[1980:2017]
  
  dfcity=dfcity[['T','PP','V','RA','FG']]
  dfcity.interpolate(inplace=True)
  
  dfcity.reset_index(inplace=True)
  
  features = 'Year'
  target =  td[targetdata-1]
  x=dfcity[features].values.reshape(-1,1)                  # To convert to 2D array
  y=dfcity[target].values.reshape(-1,1)
  
  x_train, x_test, y_train, y_test = train_test_split(x,y,test_size=0.5,random_state=4)
  
  regressor = LinearRegression()
  regressor.fit(x_train,y_train)
  
  y_prediction = regressor.predict(x_test)
  print("Few Predicted value for the test case : ")
  print(y_prediction)
  
  slope, intercept = np.polyfit(dfcity[features],dfcity[target],1)
  
  year = float(input('Enter the year to predict the value : '))
  temp = intercept + (slope*year)
  print(temp)
  
  plt.scatter(x_test,y_test,color='black')
  plt.plot(x_test, slope*x_test + intercept, '-')
  plt.show()

print("\n\n\t\t\t\t\t\tWelcome to Weather Prediction\n\n")

while(True):
  print(os.getcwd()+"1.Predict Bangalore's Weather  2.Predict Mumbai's Weather  3.Predict Delhi's Weather  4.Predict Chennai's Weather  5.Predict Kolkata's Weather  6.Exit")
  print("Enter the choice to Predict Weather : ")
  choice= int(input())

  if choice<6:
    while(True):
      print("1.Avg Temp  2.Total Rainfall  3.Avg Windspeed  4.Number of days with rain  5.Number of days with Fog  6.Exit")
      print("Enter the choice of target data : ")
      targetchoice = int(input())
      if targetchoice<6:
          city(targetchoice,choice)
          break
      elif targetchoice==6:
    	  exit()
      else:
    	  print("Invalid Choice")
    	  break
    break
  if choice==6:
      exit()
  else:
      print("Invalid Choice") 	  