const $ = require('jquery');
const select2 = require('select2');
const datepicker = require('js-datepicker');

const infoInit = (function () {
  const IDAPP = '31a1a9b4674714612d2e3008f28a6a3a';
  const oneCity = {name: [],date: [],temp: []};
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

  //расчет даты с учетом часов
  const dateRange = (name, day) => {
    (day > 0) ? typeWeatherDate(name, day*7) : typeWeatherDate(name, 5);
  }; 

  //обновление данных - дата
  const updateInfo = (select, arr) => {
    updateCity(arr.tempCityArr, arr, select);  
  };

  //поиск города
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
    let start = document.querySelectorAll('.weather__date-start');
    let date = new Date() ;
    for (const item of start) {
      item.value  = date.toLocaleDateString();
    }
  };
  // тип данных - префикс
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

  // тип данных - дата
  const typeWeatherDate = (name, day) => {
    switch (name) {
    case 'temp':
      infoWeather.temp.tempDay = day; 
      updateInfo('chart', infoWeather.temp);
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
  
  const monthArr = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const dayArr = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

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
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerT.parent.attributes['data-info'].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  }
  );
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
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerP.parent.attributes['data-info'].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  }
  );
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
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerH.parent.attributes['data-info'].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  }
  );
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
      let info = new Date(), info1 = instance.dateSelected, dataInfo = pickerW.parent.attributes['data-info'].nodeValue;
      dateRange(dataInfo, countDays(info, info1));
    },
    customMonths: monthArr,
    customDays: dayArr,
    disableMobile: false,
  });

  // Кол-во дней
  const countDays = (date1, date2) => {
    let dt1 = new Date(date1), dt2 = new Date(date2);      
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
  };

  return {
    init: () => {
      $('select').select2($('select').val('Moscow'));
      selectInfo('chart', infoWeather.temp);
      selectInfo('pressure', infoWeather.pressure);
      selectInfo('humidity', infoWeather.humidity);
      selectInfo('wind', infoWeather.wind);
      startDateInput();
    },
  };
}());

module.exports = infoInit;