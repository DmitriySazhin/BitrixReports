//Пустой объект-обманка
const dummy = {};

//Код ошибки невозможности записи в LocalStorage
const QUOTA_EXCEEDED_ERR = 22;

//Коды Статус задачи.
const REAL_STATUS = {
    'STATE_NEW' : 1,                    // Новая задача
    'STATE_PENDING' : 2,                // В ожидании
    'STATE_IN_PROGRESS' : 3,            // В ходе выполнения
    'STATE_SUPPOSEDLY_COMPLETED' : 4,   // Предположительно завершена
    'STATE_COMPLETED' : 5,              // Выполнена
    'STATE_DEFERRED' : 6,               // Отложена
    'STATE_DECLINED' : 7                // Отклонена
    };

const pathOwner ={
    "Лид":"/crm/lead/details/",
    "Сделка":"/crm/deal/details/",
    "Контакт":"/crm/contact/details/",
    "Компания":"/crm/company/details/",
    "Предложение":"/crm/quote/show/",
    "Счёт":"/crm/invoice/show/",
    "Реквизиты":"",
}

    // Поля для выборки из списка задач
const select_task = [
    'ID', 'TITLE', 'CREATED_DATE', 'CLOSED_DATE', 'DEADLINE', 'RESPONSIBLE_ID'
];

//Поля для выборки из списка дел
const select_activity = [
    'ID','COMPLETED','CREATED','DEADLINE','DIRECTION',
    'SUBJECT','RESPONSIBLE_ID','STATUS', 'TYPE_ID'
];

// Направления дела
const direction_activity = [
    '',
    'Входящие',
    'Исходящие'
];

const completed_activity = [
    'Активно',
    'Выполнено'
]

const prefixActivityList = 'crm_activity_list|';

const defaultValueSelect = 'all'; 

const elemHTMLdivOut = `<div class="out"></div>`;

const nameFields = {
    'ID'                : "ИД",
    'OWNER_ID'          : "Сущность CRM",
    'OWNER_TYPE_ID'     : "Тип Сущности CRM",
    'SUBJECT'           : "Название",
    'DESCRIPTION'       : "Описание",
    'DESCRIPTION_TYPE'  : "Тип описания",
    'CREATED'           : "Дата создания",
    'DEADLINE'          : "Крайний срок",
    'END_TIME'          : "Дата завершения"
};

const CALL_FAILED_CODE = {
    "200"       : "Успешный звонок.",
    "304"       : "Пропущенный звонок.",
    "603"       : "Отклонено.",	
    "603-S"     : "Вызов отменен.",	
    "403"       : "Запрещено.",
    "404"       : "Неверный номер.",
    "486"       : "Занято.",
    "484"       : "Данное направление не доступно.",
    "503"       : "Данное направление не доступно.",
    "480"       : "Временно не доступен.",
    "402"       : "Недостаточно средств на счету.",
    "423"       : "Заблокировано",
    "OTHER"     : "Не определен."
};

const CALL_TYPE = {
    1 : "Исходящий",
    2 : "Входящий",
    3 : "Вх. Переанправлен"
};

//Значение фильтра отчета
let filterHTML = {
    'fltEmployee'   : '',
    'dateFrom'      : '',
    'dateTo'        : ''
};

// Объект-описание шапки HTML-таблицы
let objHTMLHeadTable = [
    "column",           //Номер столбца
    "row",              //Номер строки
    "rowspan",          //Количество объединенных строк
    "colspan",          //Количество объединенных столбцов
    "id",               //Атрибут id
    "class",            //Атрибут class
    "text",             //Содержимое ячейки
    "color",            //Цвет шрифта
    "backgroundColor"   //Цвет фона ячейки    
];
const reg_data = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\+[0-9]{2}:[0-9]{2}/g;

let toDay = new Date();
let dateFrom = getFirstDayMonth(toDay,'-','ymd', true);
const constDateFrom = dateFrom;
let dateTo = getLastDayMonth(toDay,'-','ymd', true);
const constDateTo = dateTo;
const constToDay = getDayMonth(toDay,'-','ymd',true);

let getLinkToAudioFile = (link,download,duration) =>{
    let readyLink = `<div><audio src="${link}" style="width: 100%" controls=""></audio><br><br><a href="${download}">Скачать запись разговора</a><p>Длительность звонка: ${duration} сек.</p></div>`;
    return readyLink;
}

let urlPortal = function() {
    let str = window.location.search.split("&");
    for(let i=0; i<str.length; i++){
        if(str[i].indexOf("bitrix24") !== -1){
            return window.location.protocol + "//" + (str[i].substr(str[i].indexOf("=")+1));
        }
    }
}

/* Получение информации о звонке*/
function promiseInfoCalling(idActivity){
    return new Promise(resolve =>{
        BX24.callBatch({
            get_voximstat: {
                method: 'voximplant.statistic.get',
                params: {
                    "FILTER": {"CRM_ACTIVITY_ID":idActivity},
                    "SORT": "CALL_DURATION",
                    "ORDER": "DESC",
                }
            },
            get_infofile: {
                method: "disk.file.get",
                params: {
                    id: '$result[get_voximstat][0][RECORD_FILE_ID]'
                }
            }
        },
        result => {
            let arrInfo = {};
            console.log (typeof result.get_voximstat.data());
            if (result.get_voximstat.data()[0] !== undefined) {
                arrInfo['RECORD_FILE_ID'] = result.get_voximstat.data()[0].RECORD_FILE_ID;
                arrInfo['CALL_FAILED_CODE'] = result.get_voximstat.data()[0].CALL_FAILED_CODE;
                arrInfo['CALL_DURATION'] = result.get_voximstat.data()[0].CALL_DURATION;
                arrInfo['CALL_TYPE']  = result.get_voximstat.data()[0].CALL_TYPE;
                arrInfo['CALL_CATEGORY']  = result.get_voximstat.data()[0].CALL_CATEGORY;
                arrInfo['DETAIL_URL'] = result.get_infofile.data().DETAIL_URL;
                arrInfo['DOWNLOAD_URL'] = result.get_infofile.data().DOWNLOAD_URL;
            } else {
                arrInfo['RECORD_FILE_ID'] = result.get_voximstat.data().RECORD_FILE_ID;
                arrInfo['CALL_FAILED_CODE'] = result.get_voximstat.data().CALL_FAILED_CODE;
                arrInfo['CALL_DURATION'] = result.get_voximstat.data().CALL_DURATION;
                arrInfo['CALL_TYPE']  = result.get_voximstat.data().CALL_TYPE;
                arrInfo['CALL_CATEGORY']  = result.get_voximstat.data().CALL_CATEGORY;
                arrInfo['DETAIL_URL'] = result.get_infofile.data().DETAIL_URL;
                arrInfo['DOWNLOAD_URL'] = result.get_infofile.data().DOWNLOAD_URL;  
            }
            /*arrInfo['RECORD_FILE_ID'] = result.get_voximstat.data().RECORD_FILE_ID;
            arrInfo['CALL_FAILED_CODE'] = result.get_voximstat.data().CALL_FAILED_CODE;
            arrInfo['CALL_DURATION'] = result.get_voximstat.data().CALL_DURATION;
            arrInfo['CALL_TYPE']  = result.get_voximstat.data().CALL_TYPE;
            arrInfo['CALL_CATEGORY']  = result.get_voximstat.data().CALL_CATEGORY;
            arrInfo['DETAIL_URL'] = result.get_infofile.data().DETAIL_URL;
            arrInfo['DOWNLOAD_URL'] = result.get_infofile.data().DOWNLOAD_URL;*/
            
            console.log(arrInfo);
            console.log(result);
            resolve(arrInfo);
        })
    });
}

async function getInfoCalling(idActivity){
    let gottenData = await promiseInfoCalling(idActivity);
    return gottenData;
}

/* Функция. Вызова метода Битрикс.
* method - Название метода Битрикс
* params - Параметры выполнения вызываемого метода Битрикс
*/
function promiseBX24Method(method, params) {
    return new Promise (resolve => {
            let rstArray = [];
            BX24.callMethod(
                method,
                params,
                result => {
                    if(result.error()) console.error(result.error());
                    else if(result.more()) {
                        rstArray = rstArray.concat(result.data());
                        result.next();
                    } else resolve(rstArray.concat(result.data()));
                }
            );
        }
    );
}

/* Функция. Получения данных из вызова метода Битрикс в объект(массив)
* method - Название метода Битрикс  
* params - Параметры выполнения вызываемого метода Битрикс
*/
async function getDataBX24Method(method, params) {
    let gottenData = await promiseBX24Method(method, params);
    return gottenData;
}

/* Функция. Получение списка типов дел.
*/
function crmEnumActivitytype () {
    return new Promise(resolve => {
        let rstArray = [];
        BX24.callMethod(
            "crm.enum.activitytype",
            {},
            result => {
                if(result.error()) console.error(result.error());
                else if(result.more()) {
                    rstArray = rstArray.concat(result.data());
                    result.next();
                } else resolve(rstArray.concat(result.data()));
            }
        )
    });
}

/*Функция. Проверки наличия в LocalStorage данных с указанным ключом
*  key - Ключ данных в LocalStorage
*/
function isKeyInLocalStorage(key){
    let isPresent = false;
    if (localStorage.getItem(key) !== null){
        isPresent = true;
    }
    return isPresent;
}

/* Функция. Удаления заданного ключа из LocalStorage
* key - ключ удаляемых данных из LocalStorage
*/
function clearLocalStorage(key){
    if (isKeyInLocalStorage(key)) {
        localStorage.removeItem(key);
    }
}

/* Функция. Запись данных в LocalStorage
*  key      - ключ данных в LocalStorage
*  loadData - сохраняемые данные
*  Возвращаемое значение: 
*   idError - код ошибки: 
*        0 - Данные успешно записаны; 
*        1 - Данные записать не удалось. LocalStorage заполнено.
*/
function loadDataLocalStorage(key, loadData) {
    let idError = 0;
    try {
        localStorage.setItem(key, JSON.stringify(loadData));
    } catch(e) {
        if (e == QUOTA_EXCEEDED_ERR) {
            idError=1;
        }
    }
    return idError;
}

function uploadDataLocalStorage(key){
    if (isKeyInLocalStorage(key)){
        return JSON.parse(localStorage.getItem(key));
    } else {
        return 0;
    }
}
//@ Внести изменения для заполнение СЕЛЕКТА с группировкой
/* !!!!!! Функция. Формирвание элемента SELECT
*   listOption - Список элементов OPTION для SELECT
*   idElement - id элемента SELECT 
*/
function fillHTMLSelect(listOptions, idElement){
    let selectElement = document.getElementById(idElement);
    for (let key of Object.keys(listOptions)){
        let optionElement = document.createElement('option');
        optionElement.value = key;
        optionElement.text = listOptions[key];
        selectElement.options.add(optionElement);
    }
    selectElement.selectedIndex = 0;
}

async function getCommonDataToLocalStorage(){
    let listEmployee = await getDataBX24Method('user.get',[{'ACTIVE':true}]);
    //let listEmployee = await getDataBX24Method('user.get',[{}]);
    if (!isKeyInLocalStorage('users')) {
        let isLoad = loadDataLocalStorage('users', listEmployee);
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }
    
    let listDepartment = await getDataBX24Method('department.get',[{}]);
    if (!isKeyInLocalStorage('departments')) {
        let isLoad = loadDataLocalStorage('departments', listDepartment);
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }

    let listActiveType = await crmEnumActivitytype();
    if (!isKeyInLocalStorage('activetype')){
        let isLoad = loadDataLocalStorage('activetype', listActiveType);
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }

    let listOwnerType = await getDataBX24Method('crm.enum.ownertype',{});
    if (!isKeyInLocalStorage('owner_type')) {
        let isLoad = loadDataLocalStorage('owner_type', listOwnerType);
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }

    let listContentType = await getDataBX24Method('crm.enum.contenttype',{});
    if (!isKeyInLocalStorage('content_type')) {
        let isLoad = loadDataLocalStorage('content_type', listContentType);
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }

    if (!isKeyInLocalStorage('datecreate')){
        let isLoad = loadDataLocalStorage('datecreate', Date());
        if (isLoad == 1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }
}
    
async function getActivitiesDataToLocalStorage(){
    const select = [
        'ID','COMPLETED','CREATED','DEADLINE','DIRECTION',
        'DESCRIPTION','RESPONSIBLE_ID','STATUS', 'TYPE_ID',
        'END_TIME', 'START_TIME'
    ];
    let filter = {"COMPLETED":"N", "DIRECTION":[1,2]};
    let order = [
        {'RESPONSIBLE_ID':'ASC','TYPE_ID':'ASC','STATUS':'ASC'}
    ];
    let activities = await getDataBX24Method('crm.activity.list',{order, filter, select});
    if (!isKeyInLocalStorage('activitiesN')){
        let isLoad = loadDataLocalStorage('activitiesN', activities);
        if (isLoad ==1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }
    
    filter = {"COMPLETED":"Y", ">=END_TIME" : dateFrom, "=<END_TIME" : dateTo, "DIRECTION":[1,2]};
    activities = await getDataBX24Method('crm.activity.list',{order, filter, select});
    if (!isKeyInLocalStorage('activitiesY')){
        let isLoad = loadDataLocalStorage('activitiesY', activities);
        if (isLoad ==1) {
            alert("В LocalStorage нет места для хранения данных");
        }
    }
    document.querySelector('#flt_sel_empl')
}

async function buildHTMLDocument(){
    await getCommonDataToLocalStorage();
    let listEmployee = JSON.parse(localStorage.getItem('users'));
    let arrEmployee =[];
    for(let i=0, len=listEmployee.length; i<len; i++){
        let FIO = listEmployee[i].LAST_NAME + ' ' 
                + listEmployee[i].NAME + ' ' 
                + listEmployee[i].SECOND_NAME;
        console.log(listEmployee[i].UF_DEPARTMENT[0]);
        arrEmployee[`user-id-${listEmployee[i].ID}_dep-id-${listEmployee[i].UF_DEPARTMENT[0]}`] = FIO;
    }
    let listDepartment = uploadDataLocalStorage("departments");
    let arrDepartment =[];
    for(let i=0, len=listDepartment.length; i <len; i++){
        arrDepartment[`dep-id-${listDepartment[i].ID}`] = listDepartment[i].NAME;
    }
    document.getElementById("flt_dt_start").value = getFirstDayMonth(toDay,"-","ymd",false);
    document.getElementById("flt_dt_end").value = getLastDayMonth(toDay,"-","ymd",false);
    fillHTMLSelect(arrEmployee,'flt_sel_empl');
    fillHTMLSelect(arrDepartment,'flt_sel_dep');
    console.log(document.getElementById('flt_sel_dep'));
    createActivityHeadTable();
    createActivityBodyTable();
}

function createActivityHeadTable(){
    let thead = document.querySelector(".tab1-table-head");
    let row = thead.insertRow();
    row.className = thead.className + "-row-1";
    let cell = row.insertCell();
    cell.className = row.className + "-clmn-1" ;
    cell.rowSpan = 3;
    cell.colSpan = 1;
    cell.innerHTML = 'Сотрудники';
    let activType = uploadDataLocalStorage('activetype');
    if (activType !== 0) {
        for(let i=0; i < activType.length; i++){
            if (activType[i].NAME !== ""){
                if (activType[i].ID == 5) {
                    continue;
                } else if (activType[i].ID == 1 || activType[i].ID == 6 || activType[i].ID == 3){
                    cell = row.insertCell();
                    cell.className = row.className + `-clmn-${i+1}`;
                    cell.rowSpan = 2;
                    cell.colSpan = 2;
                    cell.style = 'text-align: center;';
                    cell.id = `TYPE_ID:${activType[i].ID}`;
                    cell.innerHTML = (activType[i].ID == 6)?'Чат':activType[i].NAME;
                } else {
                    cell = row.insertCell();
                    cell.className = row.className + `-clmn-${i+1}`;
                    cell.rowSpan = 1;
                    cell.colSpan = 4;
                    cell.style = 'text-align: center;';
                    cell.id = `TYPE_ID:${activType[i].ID}`;
                    cell.innerHTML = (activType[i].ID == 6)?'Чат':activType[i].NAME;
                }
            } else {continue;}
        }
        row = thead.insertRow();
        row.className = thead.className + "-row-2";
        for(let i=0; i<activType.length; i++){
            if (activType[i].NAME !== ""){
                if (activType[i].ID == 5 || activType[i].ID == 1 || activType[i].ID == 6 || activType[i].ID == 3) {
                    continue;
                } else {
                    for(let j=1; j < direction_activity.length;j++){
                        cell = row.insertCell();
                        cell.className = row.className + `-clmn-${i}-${j}`;
                        cell.rowSpan = 1;
                        cell.colSpan = 2;
                        cell.style = 'text-align: center;';
                        cell.id = `TYPE_ID:${activType[i].ID}|DIRECTION:${j}`;
                        cell.innerHTML = direction_activity[j];
                    }
                }
            } else {continue;}
        }
        row = thead.insertRow();
        row.className = thead.className + "-row-3";
        for(let i=0; i<activType.length; i++){
            if (activType[i].NAME !== ""){
                if (activType[i].ID == 5) {
                    continue;
                } else if (activType[i].ID == 1 || activType[i].ID == 6 || activType[i].ID == 3){
                        for(let k=0; k < completed_activity.length;k++){
                            cell = row.insertCell();
                            cell.className = row.className + `-clmn-${i}-X-${k}`;
                            cell.rowSpan = 1;
                            cell.style = 'text-align: center;';
                            cell.id = `TYPE_ID:${activType[i].ID}|DIRECTION:X|COMPLETED:${k}`;
                            cell.innerHTML = completed_activity[k];
                        }
                } else {
                    for(let j=1; j < direction_activity.length;j++){
                        for(let k=0; k < completed_activity.length;k++){
                            cell = row.insertCell();
                            cell.className = row.className + `-clmn-${i}-${j}-${k}`;
                            cell.rowSpan = 1;
                            cell.style = 'text-align: center;';
                            cell.id = `TYPE_ID:${activType[i].ID}|DIRECTION:${j}|COMPLETED:${k}`;
                            cell.innerHTML = completed_activity[k];
                        }
                    }
                }
            } else {continue;}
        }
    } else {
        alert("В LocalStorage нет данных");
    }
}

function createActivityBodyTable(){
    let childNodesRowHeadLast =  document.querySelector(".tab1-table-head-row-3").childNodes;
    let tbody = document.querySelector(".tab1-table-body");
    let listEmployee = uploadDataLocalStorage('users');
    if (listEmployee !== 0) {
        for(let i=0; i<listEmployee.length; i++){
            let row = tbody.insertRow();
            row.id = `user-id-${listEmployee[i].ID}_dep-id-${listEmployee[i].UF_DEPARTMENT[0]}`;
            let cell = row.insertCell();
            cell.id = row.id + '-FIO';
            cell.innerHTML = listEmployee[i].LAST_NAME + ' ' 
                            + listEmployee[i].NAME + ' ' 
                            + listEmployee[i].SECOND_NAME;
            childNodesRowHeadLast.forEach((element) =>{
                if (element.className.substr(-1,1) == 0) {
                    let cell = row.insertCell();
                    cell.id = `${row.id}|RESPONSIBLE_ID:${listEmployee[i].ID}|${element.id}`;
                } else {
                    let cell = row.insertCell();
                    cell.id = `${row.id}|RESPONSIBLE_ID:${listEmployee[i].ID}|${element.id}`;
                }
            });
        }
    } else {
        alert("В LocalStorage нет данных");
    }
}

function arrReports(){
    let matrixData = [];
    let countElement = document.querySelector('.' + document.querySelector('thead').className + '-row-3').childElementCount;
    matrixData = countElement;
    return matrixData;
}

function clearBodyTable(){
    let tbody = document.querySelector('.tab1-table-body');
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
};

function openModal(classElement, noteText, descText){
    let modal = "";
    let modalBody = "";
    let modalTitle = "";
    let modalFooter = "";
    let modalContent = "";
    let modalClose = "";
    switch (classElement){
        case "modal-detail" :
            modal = document.querySelector("#modal_detail");
            modalBody = document.querySelector("#modal_detail .modal__body");
            modalTitle = document.querySelector("#modal_detail .modal__title");
            modalTitle.style.color = "black";
            modalTitle.style.fontWeight = "bold";
            modalTitle.style.fontSize = "14px";
            modalTitle.innerHTML = noteText;
            modalClose = document.querySelector("#modal_detail .modal__close");
            break;
        case "modal-alert" :
            modal = document.querySelector("#modal_alert");
            modalContent = document.querySelector("#modal_alert .modal__content");
            modalContent.style.width = "30%";
            modalBody = document.querySelector("#modal_alert .modal__body");
            modalBody.style.color = "red";
            modalBody.style.textAlign = "center";
            modalBody.style.padding = "30px";
            modalBody.innerHTML=`<p>${noteText}</p>`;
            modalClose = document.querySelector("#modal_alert .modal__close");        
            break;
        case "modal-view" :
            modal = document.querySelector("#modal_view");
            modalBody = document.querySelector("#modal_view .modal__body");
            modalBody.innerHTML=`<div><b>${noteText}</b></div><div>${(descText === null || descText === "")?"":descText}</div>`;
            modalClose = document.querySelector("#modal_view .modal__close");
            break;
    }
    modal.style.display = "block";
    modalClose.onclick = () => {
        modal.style.display = "none";
        modalBody.innerHTML="";
    }
}

async function Proba(){
    await buildHTMLDocument();
    //await getTimeControlData(); 
    /* Событие Изменение Выбора Отдела*/
    document.querySelector('#flt_sel_dep').addEventListener('change', () =>{
        let currentDepart = document.querySelector('#flt_sel_dep').value;
        let currentEmployee = document.querySelector('#flt_sel_empl').value; 
        let listEmplDepart = document.querySelector('#flt_sel_empl').options;
        for(let i=0, len=listEmplDepart.length; i<len; i++){
            if(currentDepart === 'all') {
                listEmplDepart[i].hidden = false;
            } else {
                if(listEmplDepart[i].value.indexOf(currentDepart) === -1){
                    listEmplDepart[i].hidden = (listEmplDepart[i].value === defaultValueSelect)?false:true;
                } else {
                    listEmplDepart[i].hidden = (listEmplDepart[i].value === defaultValueSelect)?true:false;
                }
            }
            console.log(listEmplDepart[i]);
        }
        let rowEmloyees = document.querySelectorAll('tr[id^="user-id-"]');
        rowEmloyees.forEach((e) =>{
            if(currentDepart === 'all'){
                if (currentEmployee === 'all'){
                    e.hidden = false;
                } else {
                    if(e.id === currentEmployee || e.id === 'all'){
                        e.hidden = false;
                    } else {
                        e.hidden = true;
                    }
                }
                
            } else {
                if(e.id.indexOf(currentDepart) === -1){
                    e.hidden = true;
                } else {
                    e.hidden = false;
                }
            }
        });
        console.log(listEmplDepart);
    });
    /*Событие Изменение Выбора Сотрудников */
    document.querySelector('#flt_sel_empl').addEventListener('change', () =>{
        let currentValue = document.querySelector('#flt_sel_empl').value;
        let currentDepart = document.querySelector('#flt_sel_dep').value;
        //let arr = currentValue.split("_");
        if (currentValue === defaultValueSelect ) {
            document.querySelector('#flt_sel_dep').value = currentDepart;
        } else {
            document.querySelector('#flt_sel_dep').value = currentValue.split("_")[1];
        }
        
        let rowEmloyees = document.querySelectorAll('tr[id^="user-id-"]');
        rowEmloyees.forEach((e) => {
            //if (currentValue === defaultValueSelect && e.className !== 'always-hide') {
            if (currentValue === defaultValueSelect && currentDepart === defaultValueSelect) {
                e.hidden = false;
            } else if (currentValue === defaultValueSelect && currentDepart !== defaultValueSelect){
                if(e.id.indexOf(currentDepart) === -1){
                    e.hidden = true;
                } else {
                    e.hidden = false;
                }
            } else {
                //if (e.id === currentValue && e.className !== 'always-hide') {
                if (e.id === currentValue) {
                    e.hidden = false;
                } else {
                    e.hidden = true;
                }
            }
        });
    });
    /*Событие Нажатие кнопки Применить*/
    document.querySelector('#btnApplyFilter').addEventListener('click', () =>{
        let currentValue=document.querySelector('#flt_sel_empl').value;
        let currentDateFrom = document.querySelector('#flt_dt_start').value; // + suffixTimeFrom;
        let currentDateTo = document.querySelector('#flt_dt_end').value; //+ suffixTimeTo;

        if((currentDateFrom + suffixTimeFrom) !== dateFrom  || (currentDateTo + suffixTimeTo) !== dateTo) {
            if (currentDateFrom == "") {
                currentDateFrom = getFirstDayMonth(toDay,'-','ymd',false);
                document.querySelector('#flt_dt_start').value = currentDateFrom;
                currentDateFrom = currentDateFrom + suffixTimeFrom;
            } else {
                currentDateFrom = currentDateFrom + suffixTimeFrom;
            }
            if (currentDateTo == "") {
                currentDateTo = getLastDayMonth(toDay,'-','ymd',false);
                document.querySelector('#flt_dt_end').value = currentDateTo;
                currentDateTo = currentDateTo + suffixTimeTo;
            } else {
                currentDateTo = currentDateTo + suffixTimeTo;
            }
    
            if(currentDateFrom === constDateFrom && currentDateTo === constDateTo){
            } else {
                dateFrom = currentDateFrom;
                dateTo = currentDateTo;
            }
            clearBodyTable();
            createActivityBodyTable();
            getBatchArrayActivities();
        }

        let rowEmloyees = document.querySelectorAll('tr[id^="user-id-"]');
        rowEmloyees.forEach((e) => {
            //if (currentValue === defaultValueSelect && e.className !== 'always-hide') {
            if (currentValue === defaultValueSelect) {
                e.hidden = false;
            } else {
                //if (e.id === currentValue && e.className !== 'always-hide') {
                if (e.id === currentValue) {
                    e.hidden = false;
                } else {
                    e.hidden = true;
                }
            }
        });
    });
    /*Событие Нажатие кнопки Очистить */
    document.querySelector('#btnClearFilter').addEventListener('click', () => {
        document.querySelector('#flt_dt_start').value = getFirstDayMonth(toDay,'-','ymd',false);
        dateFrom = constDateFrom;
        document.querySelector('#flt_dt_end').value = getLastDayMonth(toDay,'-','ymd',false);
        dateTo = constDateTo;
        document.querySelector('#flt_sel_dep').value = defaultValueSelect;
        document.querySelector('#flt_sel_empl').value = defaultValueSelect;
        let rowEmloyees = document.querySelectorAll('tr[id^="user-id-"]');
        rowEmloyees.forEach((e) => {
            e.hidden=false;
        });
        clearBodyTable();
        createActivityBodyTable();
        getBatchArrayActivities();
    });
    /*Событие Изменение Даты завершения периода */
    document.querySelector('#flt_dt_end').addEventListener('change', ()=> {
        let currentDateFrom = document.querySelector('#flt_dt_start').value; // + suffixTimeFrom;
        let currentDateTo = document.querySelector('#flt_dt_end').value; //+ suffixTimeTo;
        if(currentDateTo == ""){
        } else {
            if (currentDateTo < currentDateFrom) {
                openModal('modal-alert', "Крайняя дата периода не может быть меньше Начальной даты периода! Введите правильную дату!");
                document.querySelector('#flt_dt_end').value = "";
                document.querySelector('#flt_dt_end').focus();
            }
        }
    });
    /*Событие Изменение Даты начала периода */
    document.querySelector('#flt_dt_start').addEventListener('change', ()=> {
        let currentDateFrom = document.querySelector('#flt_dt_start').value; // + suffixTimeFrom;
        let currentDateTo = document.querySelector('#flt_dt_end').value; //+ suffixTimeTo;
        if(currentDateTo == ""){
        } else {
            if (currentDateTo < currentDateFrom) {
                openModal('modal-alert', "Начальная дата периода не может быть больше Крайней даты периода! Введите правильную дату!");
                document.querySelector('#flt_dt_start').value = "";
                document.querySelector('#flt_dt_start').focus();
            }
        }
    });

    /* document.querySelector('#cbxShowHide').addEventListener('chenge', (e) =>{
        let chkbox = document.querySelector('#cbxShowHide');
        let hideRow = document.querySelectorAll('.always-hide');
        if(chkbox.checked) {
            hideRow.forEach(elem =>{
                elem.style.display = "none";
            });
        } else {
            hideRow.forEach(elem =>{
                elem.style.display = "table-row";
            });
        }
    }); */

    await getBatchArrayActivities();
    /*Событие нажатия кнопки на любом элементе страницы */
    window.addEventListener('click', (e) => {
        let noteText ="";
        let elem = e.target;
        if(elem.tagName == "TD" && elem.parentElement.parentElement.className =="nomodal"){
        } else if (elem.tagName == "TD" && elem.parentElement.parentElement.tagName == "TBODY" && elem.innerHTML !=="" && elem.id.indexOf("FIO") === -1){
            //user-id-774|RESPONSIBLE_ID:774|TYPE_ID:1|DIRECTION:X|COMPLETED:1
            let select = ['ID','OWNER_TYPE_ID','DESCRIPTION_TYPE','OWNER_ID','SUBJECT','DESCRIPTION','CREATED','DEADLINE','END_TIME','ASSOCIATED_ENTITY_ID','TYPE_ID','RESPONSIBLE_ID','COMPLETED'];
            let filter ={};
            let order = [{'ID':'DESC'}];
            //let order = [{'CREATED':'DESC'}];
            let idString = elem.id.split("|");
            noteText = "<b>" 
                        + document.getElementById(idString[0]+"-FIO").innerText + "</b>";            
            for(let i=0; i<idString.length; i++){
                switch (idString[i].split(":")[0]){
                    case "RESPONSIBLE_ID" : 
                        filter[idString[i].split(":")[0]]=Number(idString[i].split(":")[1]); 
                        break;
                    case "TYPE_ID" : 
                        filter[idString[i].split(":")[0]]=Number(idString[i].split(":")[1]); 
                        noteText = noteText + ".  " + nameOwnerTypeId("activetype",Number(idString[i].split(":")[1]),"name");
                        break;
                    case "DIRECTION" : 
                        if (idString[i].split(":")[1] === "X") {
                        }
                        else {
                            filter[idString[i].split(":")[0]]=Number(idString[i].split(":")[1]); 
                            noteText = noteText + ": " + ((idString[i].split(":")[1] == 1)?"Входящее":"Исходящее");
                        }
                        break;
                    case "COMPLETED" : 
                        if(idString[i].split(":")[1] === "0"){
                            filter[idString[i].split(":")[0]]="N";
                            noteText = noteText + " - Активно";
                        } else {
                            filter[idString[i].split(":")[0]]="Y";
                            noteText = noteText + " - Выполнено";
                            filter[">=END_TIME"] = dateFrom;
                            filter["=<END_TIME"] = dateTo;
                        }
                        break;
                }
            }
            let list =[];
            getDataBX24Method('crm.activity.list',{order, filter, select}).then(result => {
                //list = result;
                console.log(result);
                createDetailTable(result);
            });
            openModal('modal-detail', noteText);
            //openAlert('modal-detail', idString);
            let modalTable = document.querySelector('.modal-detail');
        } else if(elem.tagName == "A"){
            switch(elem.className){
                case "subject":
                case "HTML":
                case "bbCode":
                case "plainText":
                case "call_full":
                    openModal('modal-view', elem.parentElement.fullText, elem.parentElement.descText);
                    break;
                case "call_null":
                    console.log(elem.parentElement.activityid);
                    console.log(elem);
                    console.log(elem.dataid);
                    getInfoCalling(elem.parentElement.activityid).then(result =>{
                        console.info("getInfoCalling");
                        console.log(result);
                        if (result["DOWNLOAD_URL"] === undefined || result["DETAIL_URL"] === undefined){
                            openModal('modal-view',elem.parentElement.fullText, "ЗАПИСЬ ЗВОНКА ОТСУТСТВУЕТ!");
                        } else {
                            openModal('modal-view',elem.parentElement.fullText, getLinkToAudioFile(result["DOWNLOAD_URL"],result["DOWNLOAD_URL"],result["CALL_DURATION"]));
                        }
                    });
                    break;
                case "empty":
                    break;
            }
        };
    });


}

function showHide(){
    let chkbox = document.querySelector('#cbxShowHide');
    let hideRow = document.querySelectorAll('.always-hide');
    let currentDepart = document.querySelector('#flt_sel_dep').value;
    let currentEmployee = document.querySelector('#flt_sel_empl').value;
    console.log(currentDepart);
    console.log(currentEmployee);
    
    if(chkbox.checked) {
        hideRow.forEach(elem =>{
            if (currentDepart === defaultValueSelect){
                elem.style.display = "none";
            } else {
                if (elem.id.indexOf(currentDepart) !== -1){
                    elem.style.display = "none";
                }
            }
        });
    } else {
        hideRow.forEach(elem =>{
            if (currentDepart === defaultValueSelect){
                elem.style.display = "table-row";
            } else {
                if (currentEmployee === defaultValueSelect) {
                    if(elem.id.indexOf(currentDepart) !== -1) {
                        elem.style.display = "table-row";
                    } else {
                        elem.style.display = "none";
                    }
                } else {
                    if(elem.id === currentEmployee){
                        elem.style.display = "table-row";
                    } else {
                        elem.style.display = "none";
                    }
                }
            }
        });
    }
    
/*     if(chkbox.checked) {
        hideRow.forEach(elem =>{
            if (currentDepart === defaultValueSelect){
                elem.style.display = "none";
            } else {
                if (elem.id.indexOf(currentDepart) !== -1){
                    elem.style.display = "none";
                }
            }
        });
    } else {
        hideRow.forEach(elem =>{
            if (currentDepart === defaultValueSelect){
                elem.style.display = "table-row";
            } else {
                if (elem.id.indexOf(currentDepart) !== -1){
                    elem.style.display = "table-row";
                }
            }
        });
    } */
}

function nameOwnerTypeId(localStore, typeId, viewResult){
    let listType = uploadDataLocalStorage(localStore);
    let finded = false
    for(let i = 0; i<listType.length; i++){
        if (!finded) {
            if(listType[i].ID == typeId){
                finded = true;
                if (localStore === "owner_type"){
                    switch(viewResult){
                        case "name":
                            return listType[i]['NAME'];
                            break;
                        case "path":
                            return pathOwner[listType[i]['NAME']];
                            break;
                    }
                } else {
                    return listType[i]['NAME'];
                }
            }
        }
    }
}

function createDetailTable(listDetail){
    let lenResult = listDetail.length;
    let keyObject = Object.keys(listDetail[0]);
    let modalWindow = document.querySelector('#modal_detail .modal__body');
    let tableDetail = document.createElement('table');
    tableDetail.className = "modal__table";
    let thead = document.createElement("thead");
    let theadRow = thead.insertRow();
    theadRow.className = `${tableDetail.className}-row`;
    //['ID','OWNER_TYPE_ID','DESCRIPTION_TYPE','OWNER_ID','SUBJECT','DESCRIPTION','CREATED','DEADLINE','END_TIME','ASSOCIATED_ENTITY_ID','TYPE_ID','RESPONSIBLE_ID','COMPLETED'];
    keyObject.forEach(elem => {
        let theadRowCell = "";
        switch (elem){
            case "ID":
                theadRowCell = theadRow.insertCell();
                theadRowCell.className = theadRow.className+'-'+elem;
                theadRowCell.innerHTML = '№ пп';
                break;
            case "OWNER_TYPE_ID":
                break;
            case "DESCRIPTION_TYPE":
                break;
            case  "ASSOCIATED_ENTITY_ID" :
                break;
            case "DESCRIPTION" :
                break;
            case "TYPE_ID" :
                break;
            case "RESPONSIBLE_ID" :
                break;
            case "COMPLETED" :
                break;
            case "OWNER_ID":
                theadRowCell = theadRow.insertCell();
                theadRowCell.className = theadRow.className+'-'+elem;
                theadRowCell.innerHTML = 'Прикреплено к';
                break;
            default:
                theadRowCell = theadRow.insertCell();
                theadRowCell.className = theadRow.className+'-'+elem;
                theadRowCell.innerHTML = nameFields[elem];
                break;
        }
    });
    let countColumn = 0;
    let tbody = document.createElement("tbody");
    let tbodyRow ="";
    let tbodyRowCell = "";
    for(let i=0; i<lenResult; i++){
        tbodyRow = tbody.insertRow();
        keyObject.forEach(elem => {
            switch(elem){
                case "ID": 
                    countColumn++;
                    tbodyRowCell = tbodyRow.insertCell();
                    tbodyRowCell.innerHTML = countColumn;
                    if (listDetail[i]["DEADLINE"] < constToDay && listDetail[i]["COMPLETED"] === "N"){
                        tbodyRow.style.background = "#FA8072";
                    }
                    break;
                case "SUBJECT":
                    tbodyRowCell = tbodyRow.insertCell();
                    let innerHTML_val="";
                    let fullText_val = "";
                    let descText_val = "";
                    if (listDetail[i][elem] === null){
                        innerHTML_val = "Название отсутствует";
                        fullText_val = innerHTML_val;
                    } else {
                        if (listDetail[i][elem].length < 100) {
                            innerHTML_val = listDetail[i][elem];
                            fullText_val = innerHTML_val;
                        }  else {
                            innerHTML_val = listDetail[i][elem].substr(0,100);
                            fullText_val = listDetail[i][elem];
                        }
                    }
                    let linkPart = "";
                    if (listDetail[i]["TYPE_ID"] == 3){
                        let urlAddress = urlPortal() + `/company/personal/user/${listDetail[i]["RESPONSIBLE_ID"]}/tasks/task/view/${listDetail[i]["ASSOCIATED_ENTITY_ID"]}/`;
                        linkPart = `<a href="${urlAddress}" target="_blank">...</a>`;
                    } else if (listDetail[i]["TYPE_ID"] == 2){  
                        if(listDetail[i]["DESCRIPTION"] === null || listDetail[i]["DESCRIPTION"].indexOf("audio src=") === -1){
                            console.error(listDetail[i]["ID"]);
                            console.error(listDetail[i]);
                            tbodyRowCell.activityid = listDetail[i]["ID"];
                            linkPart = `<a href="#" class="call_null" activityid="${listDetail[i]["ID"]}" > ... </a>`;
                            console.log(linkPart);
                            console.log(tbodyRowCell.activityid);
                        } else {
                            linkPart = `<a href="#" class="call_full" > ... </a>`;
                        }
                    } else {
                        linkPart = `<a href="#" class="subject" > ... </a>`;
                    }
                    
                    if (listDetail[i]["DESCRIPTION"] === null) {
                        descText_val = "Описание отсутствует";
                    } else {
                        descText_val = listDetail[i]["DESCRIPTION"];
                    }
                    tbodyRowCell.descText = descText_val;
                    tbodyRowCell.fullText = fullText_val;
                    tbodyRowCell.innerHTML = innerHTML_val+linkPart;
                    console.log(tbodyRowCell.innerHTML);
/////////////////////////                    
                    /*if (listDetail[i][elem] === null){
                        
                    } else {
                        
                        if (listDetail[i]["TYPE_ID"] == 3){
                            let urlAddress = urlPortal() + `/company/personal/user/${listDetail[i]["RESPONSIBLE_ID"]}/tasks/task/view/${listDetail[i]["ASSOCIATED_ENTITY_ID"]}/`;
                            linkPart = `<a href="${urlAddress}" target="_blank">...</a>`;
                        } else if (listDetail[i]["TYPE_ID"] == 2) {

                        } else {
                            linkPart = `<a href="#" class="subject" > ... <a>`;
                        }
                        
                        if (listDetail[i]["DESCRIPTION"] === null) {
                            if (listDetail[i][elem].length < 100) {
                                tbodyRowCell.innerHTML = listDetail[i][elem];
                            }  else {
                                tbodyRowCell.innerHTML = listDetail[i][elem].substr(0,100)  + `<a href="#" class="subjectNULL" > ... <a>`;
                            }
                        } else {
                            tbodyRowCell.innerHTML = listDetail[i][elem].substr(0,100) + linkPart;
                            tbodyRowCell.descText = listDetail[i]["DESCRIPTION"];
                        }
                        
                        tbodyRowCell.className = "modal__table_subject";
                        tbodyRowCell.fullText = listDetail[i][elem];
                        tbodyRowCell.style.textAlign = "left";
                    }*/
                    break;
                case "OWNER_TYPE_ID":
                    break;
                case "RESPONSIBLE_ID":
                    break;
                case "ASSOCIATED_ENTITY_ID" :
                    break;
                case "OWNER_ID":
                    //https://ignatov.bitrix24.ru/crm/deal/details/4060/
                    let namePath = nameOwnerTypeId('owner_type',listDetail[i]["OWNER_TYPE_ID"],"name") + " №" + listDetail[i][elem];
                    let urlAddress = urlPortal() + nameOwnerTypeId('owner_type',listDetail[i]["OWNER_TYPE_ID"],"path") + listDetail[i][elem]+"/";
                    let urlPath=`<a href="${urlAddress}" target="_blank">${namePath}</a>`;
                    //https://ignatov.bitrix24.ru/crm/deal/details/2678/?IFRAME=Y&IFRAME_TYPE=SIDE_SLIDER
                    //https://ignatov.bitrix24.ru/crm/company/details/3020/?IFRAME=Y&IFRAME_TYPE=SIDE_SLIDER
                    tbodyRowCell = tbodyRow.insertCell();
                    tbodyRowCell.innerHTML = urlPath;
                    break;
                case "DESCRIPTION_TYPE":
                    //theadRowCell.innerHTML = nameOwnerTypeId('content_type',listDetail[i][elem]);
                    break;
                case "DESCRIPTION":
                    /* tbodyRowCell = tbodyRow.insertCell();
                    if ((listDetail[i][elem] === null)) {
                        //(listDetail[i][elem] === null)?"":listDetail[i][elem];
                    } else {
                        switch (nameOwnerTypeId('content_type',listDetail[i]["DESCRIPTION_TYPE"])){
                            case "Plain text":
                                tbodyRowCell.innerHTML = listDetail[i][elem].substr(0,0) + `<a href="#" class="plainText" >подробно<a>`;
                                break;
                            case "bbCode":
                                tbodyRowCell.innerHTML = `<a href="#" class="bbCode" >подробно<a>`;
                                break;
                            case "HTML":
                                tbodyRowCell.innerHTML = `<a href="#" class="HTML" >подробно<a>`;
                                break;
                            case "":
                                tbodyRowCell.innerHTML = listDetail[i][elem].substr(0,0) + `<a href="#" class="empty" >подробно<a>`;
                                break;
                        }
                        tbodyRowCell.className = "modal__table_description";
                        tbodyRowCell.fullText = listDetail[i][elem];
                        //tbodyRowCell.style.textAlign = "left";
                    } */
                    break;
                case "TYPE_ID" : 
                    break;
                case "COMPLETED" :
                    break;
                default:
                    tbodyRowCell = tbodyRow.insertCell();
                    if ((listDetail[i][elem] === null)) {
                        (listDetail[i][elem] === null)?"":listDetail[i][elem];
                    } else {
                        if(listDetail[i][elem].search(reg_data) === -1) {
                            tbodyRowCell.innerHTML = listDetail[i][elem];
                        } else {
                            let convertData = listDetail[i][elem].substr(0,10);
                            tbodyRowCell.innerHTML = `${convertData.substr(-2,2)}.${convertData.substr(-5,2)}.${convertData.substr(0,4)} <i>${listDetail[i][elem].substr(11,5)}</i>`;
                        }                    
                    }
                    break;
            }
        });
    
    }
    tableDetail.appendChild(thead);
    tableDetail.appendChild(tbody);
    modalWindow.appendChild(tableDetail);
}

/* Функция группировки входящего массива по заданным параметрам
*   groupArray - массив для группировки
*   groupLevel1 - поле группировки 1-го уровня
*   groupLevel2 - поле группировки 2-го уровня
*   groupLevel3 - поле группировки 3-го уровня
* Возвращаемое значение:
*   groupedArray - сгруппированный массив 
*/
function countPivotTable(grouperArray, groupLevel1, groupLevel2, groupLevel3){
    let groupedArray = groupBy(grouperArray, groupLevel1);
    let keysArray = Object.keys(groupedArray);
    for (let key of keysArray){
        groupedArray[key] = groupBy(groupedArray[key],groupLevel2);
    }
    for (let key of keysArray){
        let keysInArray = Object.keys(groupedArray[key]);
        for(let key1 of keysInArray){
            groupedArray[key][key1] = groupBy(groupedArray[key][key1],groupLevel3);
        }
    }
    return groupedArray;
}

function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        let key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

/* Функция заполнения данными таблицы
*   countArray - массив данных
*/
function fillHTMLPivotTable(countArray, completed){
    let keysLevel1 = Object.keys(countArray);
    let id_cells = '';
    let valueCompleted = (completed)?1:0
    keysLevel1.forEach(user_id =>{
        let arrayLevel2 = countArray[user_id];
        let keysLevel2 = Object.keys(arrayLevel2);
        keysLevel2.forEach(type_id => {
            let arrayLevel3 = arrayLevel2[type_id];
            let keysLevel3 = Object.keys(arrayLevel3);
            keysLevel3.forEach(direction_id =>{
                let arrayLevel4 = arrayLevel3[direction_id];
                if (type_id == 1 || type_id == 3 || type_id == 6) {
                    id_cells = `crm_activity_list|RESPONSIBLE_ID:${user_id}|TYPE_ID:${type_id}|DIRECTION:X|COMPLETED:${valueCompleted}`;
                } else {
                    id_cells = `crm_activity_list|RESPONSIBLE_ID:${user_id}|TYPE_ID:${type_id}|DIRECTION:${direction_id}|COMPLETED:${valueCompleted}`;
                }
                let elementDOM = document.getElementById(id_cells);
                if (!elementDOM){
                    document.querySelector(".text_error").innerHTML = id_cells+'<br>';
                } else {
                    elementDOM.innerHTML = arrayLevel4.length;
                }
            });
        });
    });
}

async function batchBX24(params){
    return new Promise(resolve => {
        BX24.callBatch(
            params,
            result => {
                keys = Object.keys(result).sort();
                let lenKeys = keys.length;
                let totalItog = 0;
                let cell = "";
                for(let k = 0; k < lenKeys; k++){
                    let idCell = keys[k].slice(keys[k].indexOf('|')+1);
                    totalItog = totalItog + result[keys[k]].total();
                    let cell = document.getElementById(idCell);
                    if(cell !== null){
                        cell.innerHTML = (result[keys[k]].total() == 0)?"":result[keys[k]].total();
                        if ((k + 1) == lenKeys) {
                            if (totalItog == 0) {
                                let parentCell =cell.parentElement;
                                parentCell.className = 'always-hide';
                                //parentCell.hidden = true;
                            }
                            resolve(result);
                        }
                    } else if(keys[k].indexOf('|out') !== -1){
                        //console.info(idCell);
                        idCell = idCell.substring(0,idCell.indexOf('|out'));
                        //console.log(idCell);
                        //console.log(keys[k], result[keys[k]].total());
                        if (result[keys[k]].total() !== 0) {
                            document.getElementById(idCell).innerHTML = document.getElementById(idCell).innerHTML + elemHTMLdivOut;
                        }
                    }
                }
            }
        )
    });
}

async function getBatchArrayActivities(){
    let listActiveType = uploadDataLocalStorage('activetype');
    lenListActiveType = listActiveType.length;

    let listEmployee = uploadDataLocalStorage('users');
    lenListEmployee = listEmployee.length;
    
    let arrParamBatch = {};
    
    let filter={};

    let nameMethod = prefixActivityList;
    let sort = [{"RESPONSBLE_ID":"ASC","TYPE_ID":"ASC"}];
    let select = ["ID"];

    for(let e=0; e < lenListEmployee; e++){
        arrParamBatch = {};
        for (let a=0; a < lenListActiveType; a++){
            if (listActiveType[a].ID == 1 || listActiveType[a].ID == 3 || listActiveType[a].ID == 6){
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N","<DEADLINE":constToDay};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:X|COMPLETED:0|out`] = ['crm.activity.list',{sort,filter,select}];
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N"};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:X|COMPLETED:0`] = ['crm.activity.list',{sort,filter,select}];
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"Y",">=END_TIME":dateFrom,"=<END_TIME":dateTo};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:X|COMPLETED:1`] = ['crm.activity.list',{sort,filter,select}];
            } else {
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N","DIRECTION":1,"<DEADLINE":constToDay};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:1|COMPLETED:0|out`] = ['crm.activity.list',{sort,filter,select}];
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N","DIRECTION":2,"<DEADLINE":constToDay};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:2|COMPLETED:0|out`] = ['crm.activity.list',{sort,filter,select}];
                
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N","DIRECTION":1};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:1|COMPLETED:0`] = ['crm.activity.list',{sort,filter,select}];
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"N","DIRECTION":2};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:2|COMPLETED:0`] = ['crm.activity.list',{sort,filter,select}];
                
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"Y","DIRECTION":1,">=END_TIME":dateFrom,"=<END_TIME":dateTo};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:1|COMPLETED:1`] = ['crm.activity.list',{sort,filter,select}];
                filter = {"RESPONSIBLE_ID":listEmployee[e].ID, "TYPE_ID":listActiveType[a].ID,"COMPLETED":"Y","DIRECTION":2,">=END_TIME":dateFrom,"=<END_TIME":dateTo};
                arrParamBatch[`crm_activity_list|user-id-${listEmployee[e].ID}_dep-id-${listEmployee[e].UF_DEPARTMENT[0]}|RESPONSIBLE_ID:${listEmployee[e].ID}|TYPE_ID:${listActiveType[a].ID}|DIRECTION:2|COMPLETED:1`] = ['crm.activity.list',{sort,filter,select}];
            }
        }
        let s = await batchBX24(arrParamBatch);
    }
}

async function getTimeControlData(){
    let listDepartment = uploadDataLocalStorage('departments');
    let filter = {};
    let arrParamBatch = {};
    for(let d=0; d<listDepartment.length; d++){
        filter = {"DEPARTMENT_ID":listDepartment[d].ID};
        arrParamBatch[`DEPARTMENT_ID:${listDepartment[d].ID}`]=['timeman.timecontrol.reports.users.get',filter];
    }

    let listTimeControl = await batchBX24TC(arrParamBatch);
    let theadTimeControl = document.querySelector("#tab0-table-head");
    console.log(theadTimeControl);
    let tbodyTimeControl = document.querySelector("#tab0-table-body");
    console.log(tbodyTimeControl);
    let rowTHead = theadTimeControl.insertRow();
    console.log(rowTHead);
    rowTHead.className="nomodal";
    let rowBody = "";
    let cell = rowTHead.insertCell();
    cell.innerHTML = "№ пп";
    cell = rowTHead.insertCell();
    cell.innerHTML = "Сотрудник";
    cell = rowTHead.insertCell();
    cell.innerHTML = "Должность";
    cell = rowTHead.insertCell();
    cell.innerHTML = "Последняя активность";
    let keyList = Object.keys(listTimeControl);
    for(let k=0; k < keyList.length; k++){
        if (nameOwnerTypeId("departments",keyList[k].split(":")[1],"name") !== "Чат-боты") {
            rowBody = tbodyTimeControl.insertRow();    
            rowBody.className="nomodal";
            cell = rowBody.insertCell();
            cell.colSpan = 4;
            cell.className = "colspan";
            cell.innerHTML = "ОТДЕЛ: " + nameOwnerTypeId("departments",keyList[k].split(":")[1],"name");
            let a = listTimeControl[keyList[k]].data();
            let conutRow = 1;
            for(let i=0; i<a.length; i++){
                rowBody = tbodyTimeControl.insertRow();
                cell = rowBody.insertCell();
                cell.innerHTML = conutRow;
                conutRow++;
                cell = rowBody.insertCell();
                cell.innerHTML = a[i].name;
                cell = rowBody.insertCell();
                cell.innerHTML = a[i].work_position;
                cell = rowBody.insertCell();
                //`${convertData.substr(-2,2)}.${convertData.substr(-5,2)}.${convertData.substr(0,4)}`;
                //cell.innerHTML = a[i].last_activity_date;
                if (a[i].last_activity_date === null) {
                    cell.innerHTML = "";
                } else {
                    cell.innerHTML = `${a[i].last_activity_date.substr(0,10).substr(-2,2)}.${a[i].last_activity_date.substr(0,10).substr(-5,2)}.${a[i].last_activity_date.substr(0,10).substr(0,4)} <i>${a[i].last_activity_date.substr(11,5)}</i>`;
                }
            }
        }
    }
}

async function batchBX24TC(params){
    return new Promise(resolve => {
        BX24.callBatch(
            params,
            result => {
                resolve(result);
            }
        )
    });
}

