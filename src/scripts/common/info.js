const $ = require('jquery');
const select2 = require('select2');

const infoInit = (function () {
  const IDAPP = '31a1a9b4674714612d2e3008f28a6a3a';
  const oneCity = {name: [],date: [],temp: []};
  const infoWeather = {
    temp:{
      tempDate: [], //список дат
      tempCityArr: [], //список городов
      tempArr: [], //список температур
    },
    press:{
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    humidity:{
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    wind:{
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
  };

  //выбор городов
  const selectInfo = (select, arr) => {
    //предзагрузка
    arr.tempCityArr.push($(`.${select}`).select2('val'));
    updateCity(arr.tempCityArr, arr, select);
    //выбор
    $(`.${select}`).change(function (e) { 
      arr.tempCityArr = [];
      arr.tempArr = [];
      arr.tempCityArr.push($(`.${select}`).select2('val'));
      updateCity(arr.tempCityArr, arr, select);
    });

  };

  //обновление данных городов
  const updateCity = (arrCity, arr, grafType) => {
    arr.tempArr = [];
    let newArr = arrCity[0];
    newArr.forEach((item, i) => {
      sendCity(item, arr, grafType);
    });
    changeChart(arr, grafType);
  };

  //Добавим в список
  const updateList = (name, temp, arr) => {
    arr.tempArr.push([...name, ...temp]);
  };

  //обнулить массив
  const arrClear = () => {
    oneCity.name=[];
    oneCity.date=[];
    oneCity.temp=[];
  };

  //поиск города
  const sendCity = (city='Moscow', arr, info) => {
    fetch(`http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${IDAPP}&cnt=16`)
      .then((res) => res.json())
      .then((data) => {
        arrClear();
        oneCity.name.push(city);
        data.list.forEach(function(item){ 
          oneCity.date.push(item.dt_txt.substring(0, 16));
          typeWeatherItem(item, info);
        });
        updateList(oneCity.name, oneCity.temp, arr);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  // тип данных - погода
  const typeWeather = (name) => {
    switch (name) {
    case 'chart':
      return '°C ';
      break;
    case 'pressure':
      return 'hpa';
      break;
    case 'humidity':
      return '%';
      break;
    case 'wind':
      return 'm/s';
      break;
    }
  };  

  // тип данных - погода
  const typeWeatherItem = (item, name) => {
    switch (name) {
    case 'chart':
      oneCity.temp.push(item.main.temp); 
      break;
    case 'pressure':
      oneCity.temp.push(item.main.pressure); 
      break;
    case 'humidity':
      oneCity.temp.push(item.main.humidity); 
      break;
    case 'wind':
      oneCity.temp.push(item.wind.speed); 
      break;
    }
  };

  // создание графика
  const changeChart = (arr, grafType ) => {
    var chart = c3.generate({
      bindto: `#${grafType}`,
      data: {
        x: 'x',
        y: 'y',
        xFormat: '%Y-%m-%d %H:%M',
        columns: [],
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d %H:%M',
          },
        },
        y:{
          tick: {
            format: function (d) { return d.toFixed(1) + typeWeather(grafType); },
          },
        },
      },
    });
    setTimeout(function () {
      chart.load({
        columns: arrCitys(arr.tempArr),
      });

    }, 500);
  };

  // создание графика
  const arrCitys = (item) => {
    let arrC = [];
    arrC.push(['x', ...oneCity.date]);
    item.forEach(function(element, i, arr){
      arrC.push(element);
    });
    return arrC ;
  };

  return {
    init: () => {
      $('select').select2($('select').val('Moscow'));
      selectInfo('chart', infoWeather.temp);
      selectInfo('pressure', infoWeather.press);
      selectInfo('humidity', infoWeather.humidity);
      selectInfo('wind', infoWeather.wind);
    },
  };
}());

module.exports = infoInit;