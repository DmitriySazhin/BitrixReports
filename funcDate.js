//Период выборки данных
const suffixTimeFrom = 'T00:00:00+03:00';
const suffixTimeTo = 'T23:59:59+03:00';

/* Функция. Последний день месяца.
*  
*/
function getLastDayMonth(dtCurDate, strSeparate, strPattern, blnSuffix) {
    let intLastDayMonth = 0;                        //Последник день месяца
    let intYearCurrent = dtCurDate.getFullYear();   //Год из переданной даты
    let intMonth = dtCurDate.getMonth()+1;          //Номер месяца из переданной даты
        switch(intMonth) {
            //Январь
            case 1:     intLastDayMonth = 31; break;
            //Февраль
            case 2:     
                if (intYearCurrent%4 === 0) {intLastDayMonth = 29; break;}
                else {intLastDayMonth = 28; break;}
            //Март
            case 3:     intLastDayMonth = 31; break;
            //Апрель
            case 4:     intLastDayMonth = 30; break;
            //Май
            case 5:     intLastDayMonth = 31; break;
            //Июнь
            case 6:     intLastDayMonth = 30; break;
            //Июль
            case 7:     intLastDayMonth = 31; break;
            //Август
            case 8:     intLastDayMonth = 31; break;
            //Сентябрь
            case 9:     intLastDayMonth = 30; break;
            //Октябрь
            case 10:    intLastDayMonth = 31; break;
            //Ноябрь
            case 11:    intLastDayMonth = 30; break;
            //Декабрь
            case 12:    intLastDayMonth = 31; break;
        }
    //Итоговая выходная строка
    let strLastDayMonth = '';
    if (strPattern == 'ymd') {strLastDayMonth = intYearCurrent + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate  + intLastDayMonth;}
    else {strLastDayMonth = intLastDayMonth + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate + intYearCurrent;}
    strLastDayMonth = (blnSuffix == true) ? strLastDayMonth + suffixTimeTo : strLastDayMonth;
    return strLastDayMonth;
}

/* Функция. Первый день месяца
* 
*/
function getFirstDayMonth(dtCurDate, strSeparate, strPattern, blnSuffix) {
    let intFirstDayMonth = 1;
    let intYearCurrent = dtCurDate.getFullYear();
    let intMonth = dtCurDate.getMonth()+1;
    //Итоговая выходная строка
    let strFirstDayMonth = '';
    if (strPattern == 'ymd') {
        strFirstDayMonth = intYearCurrent + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate + (intFirstDayMonth<10?('0'+intFirstDayMonth):intFirstDayMonth);
    }
    else {
        strFirstDayMonth = (intFirstDayMonth<10?('0'+intFirstDayMonth):intFirstDayMonth) + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate + intYearCurrent;
    }
    strFirstDayMonth = (blnSuffix == true) ? strFirstDayMonth + suffixTimeFrom : strFirstDayMonth;
    return strFirstDayMonth;
}

/* Функция. Текущая дата
*  
*/
function getDayMonth(dtCurDate, strSeparate, strPattern, blnSuffix) {
    let intDayMonth = dtCurDate.getDate();
    let intYearCurrent = dtCurDate.getFullYear();
    let intMonth = dtCurDate.getMonth()+1;
    let intHours = dtCurDate.getHours();
    let intMinutes = dtCurDate.getMinutes();
    let intSeconds = dtCurDate.getSeconds();

    //Итоговая выходная строка
    let strDayMonth = '';
    if (strPattern == 'ymd') {
        strDayMonth = intYearCurrent + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate + (intDayMonth<10?('0'+intDayMonth):intDayMonth) ;
    }
    else {
        strDayMonth = (intDayMonth<10?('0'+intDayMonth):intDayMonth) + strSeparate + (intMonth<10?('0' + intMonth):intMonth) + strSeparate + intYearCurrent;
    }
    if (blnSuffix == true) {
        intHours = (intHours<10?('0'+intHours):intHours);
        intMinutes = (intMinutes<10?('0'+intMinutes):intMinutes);
        intSeconds = (intSeconds<10?('0'+intSeconds):intSeconds);
        strDayMonth = strDayMonth + 'T' + intHours + ':' + intMinutes + ':' + intSeconds + '+03:00';
    }
    return strDayMonth;
}