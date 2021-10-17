import requests
from bs4 import BeautifulSoup
import json


def weber():
    city = input("city name : ")
    html = requests.get(
        "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid=6db1adb8691ea5db220273eb2876c16d")
    x = BeautifulSoup(html.content, "html.parser")
    weather1 = str(x.get_text())

    #  loading weather1 data as json

    json_load = json.loads(weather1)

    # printing data in celcius

    print("temperature in " + str(city) +
          " is : "+str(json_load["main"]["temp"])+"°")

    # weather_data = json_load["main"]
    # print(json_load.get("main"))
    # for value in weather_data.values():
    #     print(type(value))


weber()
