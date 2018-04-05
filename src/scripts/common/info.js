const $ = require('jquery');
const select2 = require('select2');
const datepicker = require('js-datepicker');

const infoInit = (function () {
  const IDAPP = '31a1a9b4674714612d2e3008f28a6a3a';
  const oneCity = {name: [],date: [],temp: []};
  const monthArr = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const dayArr = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const infoWeather = {
    temp:{
      tempDay: 7,
      tempDate: [], //список дат
      tempCityArr: [], //список городов
      tempArr: [], //список температур
    },
    pressure:{
      tempDay: 7,
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    humidity:{
      tempDay: 7,
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    wind:{
      tempDay: 7,
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
      sendCity(item, arr, grafType, arr.tempDay);
    });
    
    changeChart(arr, grafType);
  };

  //Добавление в список
  const updateList = (name, temp, arr) => {
    arr.tempArr.push([...name, ...temp]);
  };

  //Обнулить массив
  const arrClear = () => {
    oneCity.name=[];
    oneCity.date=[];
    oneCity.temp=[];
  };

  //остаток итераций до нового дня
  const countTime = (time) => {
    switch (time) {
    case '00:00:':
      return 8;
      break;
    case '03:00':
      return 7;
      break;
    case '06:00':
      return 6;
      break;
    case '09:00':
      return 5;
      break;
    case '12:00':
      return 4;
      break;
    case '15:00':
      return 3;
      break;
    case '18:00':
      return 2;
      break;
    case '21:00':
      return 1;
      break;
    default:
      return 0;
      break;
    }
  };

  // Расчет даты при условии остатка часов до нового дня
  const countTimeNewDay = (day) => {
    let currentTime = oneCity.date[0].substring(11, 16),
      count = countTime(currentTime);
    return day * 8 + count;
  };

  // Точное кол-во дней
  const dateRange = (name, day) => {
    (day > 0) ? typeWeatherDate(name, countTimeNewDay(day)) : typeWeatherDate(name, 5);
  }; 

  // Обновление данных - дата
  const updateInfo = (select, arr) => {
    updateCity(arr.tempCityArr, arr, select);  
  };

  //Поиск города
  const sendCity = (city='Moscow', arr, info, cnt='7') => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${IDAPP}&cnt=${cnt}`)
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

  // Дата start
  const startDateInput = () => {
    let start = document.querySelectorAll('.weather__date-start'),
      date = new Date();
    for (const item of start) {
      item.value  = date.toLocaleDateString();
    }
  };

  // Тип данных - префикс
  const typeWeather = (name) => {
    switch (name) {
    case 'temp':
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

  // Тип данных - погода
  const typeWeatherItem = (item, name) => {
    switch (name) {
    case 'temp':
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

  // Тип данных - дата
  const typeWeatherDate = (name, day) => {
    switch (name) {
    case 'temp':
      infoWeather.temp.tempDay = day; 
      updateInfo('temp', infoWeather.temp);
      break;
    case 'pressure':
      infoWeather.pressure.tempDay = day; 
      updateInfo('pressure', infoWeather.pressure);
      break;
    case 'humidity':
      infoWeather.humidity.tempDay = day; 
      updateInfo('humidity', infoWeather.humidity);
      break;
    case 'wind':
      infoWeather.wind.tempDay = day; 
      updateInfo('wind', infoWeather.wind);
      break;
    }
  };

  // создание графика
  const changeChart = (arr, grafType ) => {
    let temp = c3.generate({
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
            format: '%H:%M',
          },
        },
        y:{
          tick: {
            format: function (d) { return d.toFixed(1) + typeWeather(grafType); },
          },
        },
      },
      tooltip: {
        format: {
          title: function (d) { 
            return  d.toLocaleString(); 
          },
        },
      },
    });
    setTimeout(function () {
      temp.load({
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

  //datepicker
  let pickerT = datepicker(document.querySelector('.date-temp .weather__date-end'), {
    startDate: new Date(), 
    startDay: 1, 
    dateSelected: new Date(new Date().setDate(new Date().getDate() + 1)),
    minDate: new Date(), 
    maxDate: new Date(new Date().setDate(new Date().getDate() + 6)), 
    noWeekends: false, 
    formatter: function(el, date) {
      el.value = date.toLocaleDateString();
    },
    onSelect: function(instance) {
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerT.parent.parentNode.attributes[1].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  });
  let pickerP = datepicker(document.querySelector('.date-pressure .weather__date-end'), {
    startDate: new Date(), 
    startDay: 1, 
    dateSelected: new Date(new Date().setDate(new Date().getDate() + 1)),
    minDate: new Date(), 
    maxDate: new Date(new Date().setDate(new Date().getDate() + 6)), 
    noWeekends: false, 
    formatter: function(el, date) {
      el.value = date.toLocaleDateString();
    },
    onSelect: function(instance) {
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerP.parent.parentNode.attributes[1].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  });
  const pickerH = datepicker(document.querySelector('.date-humidity .weather__date-end'), {
    startDate: new Date(), 
    startDay: 1, 
    dateSelected: new Date(new Date().setDate(new Date().getDate() + 1)),
    minDate: new Date(), 
    maxDate: new Date(new Date().setDate(new Date().getDate() + 6)), 
    noWeekends: false, 
    formatter: function(el, date) {
      el.value = date.toLocaleDateString();
    },
    onSelect: function(instance) {
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerH.parent.parentNode.attributes[1].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  });
  const pickerW = datepicker(document.querySelector('.date-wind .weather__date-end'), {
    startDate: new Date(), 
    startDay: 1, 
    dateSelected: new Date(new Date().setDate(new Date().getDate() + 1)),
    minDate: new Date(), 
    maxDate: new Date(new Date().setDate(new Date().getDate() + 6)), 
    noWeekends: false, 
    formatter: function(el, date) {
      el.value = date.toLocaleDateString();
    },
    onSelect: function(instance) {
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerW.parent.parentNode.attributes[1].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  });

  // Кол-во дней
  const countDays = (date1, date2) => {
    let dt1 = new Date(date1), dt2 = new Date(date2);      
    return  Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
  };

  return {
    init: () => {
      $('select').select2($('select').val('Moscow'));
      selectInfo('temp', infoWeather.temp);
      selectInfo('pressure', infoWeather.pressure);
      selectInfo('humidity', infoWeather.humidity);
      selectInfo('wind', infoWeather.wind);
      startDateInput();
    },
  };
}());

module.exports = infoInit;