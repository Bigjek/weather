(function(){
  const datepicker = require('js-datepicker');
  class DatePickers{
    constructor(elem){
      this.elem = elem;
    }
    // Расчет кол-ва дней
    countDays(date1, date2) {
      let dt1 = new Date(date1), dt2 = new Date(date2);      
      return  Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
    } 
    // Подключение календарей
    start(elem){
      const dateRangeBlock = require ('./info');
      const monthArr = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
      const dayArr = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
      let count = this.countDays;
      let start = datepicker(elem, {
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
          let info = new Date(), info1 = instance.dateSelected, dataInfo = start.parent.parentNode.attributes[1].nodeValue;
          dateRangeBlock.dateRange(dataInfo, count(info, info1));
        },
        customMonths: monthArr,
        customDays: dayArr,
        disableMobile: false,
      });
    }
  }
  module.exports = DatePickers;
})();