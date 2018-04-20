(function(){
    
  class Chart {
    constructor(el){
      this.el = el;
    }
    // Добавление префиксов
    typeWeather(name){
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
    } 
    // создание графика
    changeChart (arr, grafType ){
      const dateRangeBlock = require ('./info');
      const typeW = this.typeWeather(grafType);
      const temp = c3.generate({
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
              format: function (d) { return d.toFixed(1) + typeW; },
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
          columns: dateRangeBlock.arrCitys(arr.tempArr),
        });
      }, 500);
    }
  }
  module.exports = Chart;
})();