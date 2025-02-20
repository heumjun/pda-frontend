import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const mypage = function(){

    let selectedDates = {start:null,end:null};       //선택된 날짜짜
    let calendar = null;
    let eventStartDate = input.date('#eventStartDate'); //운동실행일자
    let dietStartDate = input.date('#dietStartDate'); //식단일자    
    let dietMeal = input.comboBox('#dietMeal',[],'didCode','didMeal'); //식사구분

    // let fileUpload = $('#profile-img').get(0).dropzone;
    
    const calendarInit = ()=>{

        const Selectors = {
            ACTIVE: '.active',
            ADD_EVENT_FORM: '#addEventForm',    //운동등록 폼
            ADD_EVENT_MODAL: '#addEventModal',  //운동등록 모달
            ADD_DIET_FORM: '#addDietForm',      //식단등록 폼
            ADD_DIET_MODAL: '#addDietModal',    //식단등록 모달
            CALENDAR: '#appCalendar',
            CALENDAR_TITLE: '.calendar-title',
            DATA_CALENDAR_VIEW: '[data-fc-view]',
            DATA_EVENT: '[data-event]',
            DATA_VIEW_TITLE: '[data-view-title]',
            // EVENT_DETAILS_MODAL: '#eventDetailsModal',

            // EVENT_DETAILS_MODAL_CONTENT: '#eventDetailsModal .modal-content',
            EVENT_START_DATE: '#addEventModal [name="startDate"]',
            INPUT_TITLE: '[name="title"]'
        };
        const Events = {
            CLICK: 'click',
            SHOWN_BS_MODAL: 'shown.bs.modal',
            HIDDEN_BS_MODAL: 'hidden.bs.modal',
            SUBMIT: 'submit'
        };
        const DataKeys = {
            EVENT: 'event',
            FC_VIEW: 'fc-view'
        };
        const ClassNames = {
            ACTIVE: 'active'
        };
        
        const updateTitle = function updateTitle(title) {
            document.querySelector(Selectors.CALENDAR_TITLE).textContent = title;
        };
        
        let appCalendar = document.querySelector(Selectors.CALENDAR);
        let addEventForm = document.querySelector(Selectors.ADD_EVENT_FORM);
        let addEventModal = document.querySelector(Selectors.ADD_EVENT_MODAL);

        let addDietForm = document.querySelector(Selectors.ADD_DIET_FORM);
        let addDietModal = document.querySelector(Selectors.ADD_DIET_MODAL);
        
        if (appCalendar) {
            calendar = renderCalendar(appCalendar, {
                headerToolbar: false,
                dayMaxEvents: 2,
                height: 800,
                stickyHeaderDates: false,
                locale: "ko",
                views: {
                    week: {
                    eventLimit: 3
                    }
                },
                eventTimeFormat: {
                    hour: 'numeric',
                    minute: '2-digit',
                    omitZeroMinute: true,
                    meridiem: true
                },
                //events: eventList,
                eventClick: function eventClick(info) {
                    
                    selectedDates = {
                        start: dateUtils.formatDate(info.event.start,'YYYY-MM-DD'), // 시작 날짜
                        end: dateUtils.formatDate(info.event.start,'YYYY-MM-DD')     // 끝 날짜
                    };
                    
                    if(info.event.extendedProps.gbn === 'health'){
                        loadScheduleHealth();
                        $('#addEventModal').modal('show');   
                    }

                    if(info.event.extendedProps.gbn === 'diet'){
                        loadScheduleDiet();
                        $('#addDietModal').modal('show');   
                    }
                    


                },
                dateClick: function dateClick(info) {
                    
                    selectedDates = {
                        start: info.dateStr, // 시작 날짜
                        end: info.dateStr     // 끝 날짜
                    };
                    
                },
                selectable: true,
                select: function (info) {
                // 날짜 선택 시 호출되는 이벤트
                    selectedDates = {
                        start: info.startStr, // 시작 날짜
                        end: info.endStr     // 끝 날짜
                    };
                }

            });
            updateTitle(calendar.currentData.viewTitle);
            document.querySelectorAll(Selectors.DATA_EVENT).forEach(function (button) {
              button.addEventListener(Events.CLICK, function (e) {
                let el = e.currentTarget;
                let type = utils.getData(el, DataKeys.EVENT);
        
                switch (type) {
                  case 'prev':
                    calendar.prev();
                    updateTitle(calendar.currentData.viewTitle);
                    break;
        
                  case 'next':
                    calendar.next();
                    updateTitle(calendar.currentData.viewTitle);
                    break;
        
                  case 'today':
                    calendar.today();
                    updateTitle(calendar.currentData.viewTitle);
                    selectedDates = {
                        start: dateUtils.formatDate(calendar.getDate(),'YYYY-MM-DD'), // 시작 날짜
                        end: dateUtils.addDay(calendar.getDate(),1,'YYYY-MM-DD') // formatDate(calendar.getDate(),'YYYY-MM-DD')  // 끝 날짜
                    };
                    
                    break;
        
                  default:
                    calendar.today();
                    updateTitle(calendar.currentData.viewTitle);
                    break;
                }
              });
            });
            
            addEventForm && addEventForm.addEventListener(Events.SUBMIT, function (e) {
              e.preventDefault();
            
            });

        }
        
        addEventModal && addEventModal.addEventListener(Events.SHOWN_BS_MODAL, function (_ref13) {
            //let currentTarget = _ref13.currentTarget;
            loadScheduleHealth();
        });

        addDietModal && addDietModal.addEventListener(Events.SHOWN_BS_MODAL, function (_ref13) {
            loadScheduleDiet();
            
        });

        
        //처음 로딩시 오늘날짜 셋팅
        selectedDates = {
            start: dateUtils.formatDate(calendar.getDate(),'YYYY-MM-DD'), // 시작 날짜
            end: dateUtils.addDay(calendar.getDate(),1,'YYYY-MM-DD') // formatDate(calendar.getDate(),'YYYY-MM-DD')  // 끝 날짜
        };

        
        
        
    }

    /**
     * 식단이미지 초기화
     */
    const dietImageInit = ()=>{
        //프로필 사진 초기화
        let fileUpload = $('#profile-img').get(0).dropzone;
        fileUpload.removeAllFiles(true);
        //removeAllFiles로 파일 초기화 할경우 아래코드도 없어져서 파일삭제후 태그 추가해줌.
        $('#profile-img .dz-preview').html(
            `<div class="dz-preview-cover d-flex align-items-center justify-content-center mb-3 mb-md-0">
                <div class="avatar avatar-5xl"><img class="rounded-circle" src="../../assets/img/team/empty-thumb.png" alt="..." data-dz-thumbnail="data-dz-thumbnail" /></div>
                <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress=""></span></div>
            </div>`
        );
    }
    /**
     * 선택한 일자에 식단정보 불러오기
     */
    const loadScheduleDiet = async ()=>{
        
        dietImageInit();    //이미지 초기화

        dietStartDate.value = selectedDates.start;

        let userInfo = $('#data-params').data('params').userInfo;
        let no = userInfo.no;

        let params = {
            uri: `customer-info/diets/excutes/${no}`,
            startDat: selectedDates.start,
            endDat: selectedDates.start
        };

        try {
            //본인이 해당일자에 운동실행한 결과리스트
            let {dietExcuteList} = await ajax.getAjax(params,false);

            dietMeal.itemsSource = dietExcuteList;
            
        } catch (error) {
            console.debug(error);
        }

    }

    /**
     * 선택한 일자에 운동정보 불러오기기
     */
    const loadScheduleHealth = async ()=>{
        eventStartDate.value = selectedDates.start;

        $('#eventList').html("");
        
        let userInfo = $('#data-params').data('params').userInfo;
        let no = userInfo.no;

        let params = {
            uri: `customer-info/healths/excutes/${no}`,
            startDat: selectedDates.start,
            endDat: selectedDates.start
        };

        try {
            //본인이 해당일자에 운동실행한 결과리스트
            let {healthExcuteList} = await ajax.getAjax(params,false);

            let sss = "";

            //고객이 등록한 운동 프로그램
            healthExcuteList.forEach((item,index)=>{
                $('#eventTitle').val(item.hemName);
                let isExecute =  (item.hexExecute || 'N')==='Y';
                
                sss+=`<div class="form-check form-switch">
                        <input class="form-check-input" id="eventList${index}" type="checkbox" ${isExecute?'checked':''} data-health-program='{"hCode":${item.hedHcode},"hdCode":${item.hedCode}}'/>
                        <label class="form-check-label" for="eventList${index}">${item.hedExecise}(${item.hedBody}) : <span class=" badge-soft-success btn-sm">${item.hedCycle}</span></label>
                      </div>`;
                
            });
            
            $('#eventList').html(sss);
            
        } catch (error) {
            console.debug(error);
        }
    }

    /**
     * 일자별로 운동실행 정보를 받아와서 캘린더에 표기기
     */
    const search = async ()=>{
        
        //고객번호 받아와야함.
        let userInfo = $('#data-params').data('params').userInfo;
        let no = userInfo.no;

        let params = {
            uri: `customer-info/healths/${no}`,
            //startDat: dateUtils.firstDayOfMonth(calendar.getDate(),'YYYY-MM-DD'),
            //endDat: dateUtils.lastDayOfMonth(calendar.getDate(),'YYYY-MM-DD')
        };
        let params2 = {
            uri: `customer-info/diets/${no}`,
        };

        try {
            
            let {customerHealthList} = await ajax.getAjax(params,true); //일자별 운동내역
            let {customerDietList} = await ajax.getAjax(params2,true); //일자별 식단내역
            
            calendar.removeAllEvents();
            customerHealthList.forEach(item=>{
                calendar.addEvent({
                    title: '운동내역',
                    start: item.hexDate,
                    end: item.hexDate,
                    allDay: true,
                    className: "bg-soft-primary",       
                    gbn:'health'    //구분
                })
            });

            customerDietList.forEach(item=>{
                calendar.addEvent({
                    title: '식단내역',
                    start: item.dexDate,
                    end: item.dexDate,
                    allDay: true,
                    className: "bg-soft-warning",       
                    gbn:'diet'    //구분
                })
            });
            
        } catch (error) {
            console.debug(error);
        }
    }
    /**
     * 해당 일자에 운동 실행유무를 저장
     */
    const saveOfCustomerHealth = ()=>{
        
        let excuteList = new Array();
        
        //고객번호 받아와야함.
        let userInfo = $('#data-params').data('params').userInfo;
        
        $('[data-health-program]').each(function(){
            let program = $(this).data('healthProgram');
            excuteList.push(
                {
                    hexNo:userInfo.no,
                    hexDate:eventStartDate.value,
                    hexHcode: program.hCode,
                    hexHdcode: program.hdCode,
                    hexExecute:$(this).is(':checked')
                }
            )
        });
        
        excuteList.forEach(item=>item.hexExecute = item.hexExecute?'Y':'N');

        let params = {
            uri: `customer-info/healths`,
            excuteList: excuteList
        };
        
        ajax.postAjax(params,true).then(async date=>{
            await search();
            pushMsg('등록 되었습니다.');
            $('#addEventModal').modal('hide');    
        }).catch(e=>console.debug(e));
        
    }
    /**
     * 해당 일자에 식단을 저장
     */     
    const saveOfCustomerDiet = ()=>{
        let userInfo = $('#data-params').data('params').userInfo;

        let fileUpload = $('#profile-img').get(0).dropzone;
        let files = fileUpload.getAcceptedFiles();
        
        if(fileUpload.getRejectedFiles().length>0){
            alertWarning('저장불가','[첨부파일] 오류내용을 확인하세요.');
            return;
        }

        let params = {
            uri: `customer-info/diets`,
            dexNo: userInfo.no,
            dexDate: dietStartDate.value,
            dexHcode: dietMeal.selectedItem.didHcode,
            dexHdcode: dietMeal.selectedItem.didCode,
            dexMenu: $('#dietRealMenu').val(),
            
        }

        ajax.fileUploadAjax(params,files,true).then(async date=>{
            await search();
            pushMsg('등록 되었습니다.');
            $('#addDietModal').modal('hide');    
        });
    }

    /**
     * 각종 이벤트
     */
    const handleEvent = ()=>{
        $('#saveOfCustomerHealth').on('click',saveOfCustomerHealth);
        $('#eventStartDate').on('click',()=>{
            eventStartDate.isDroppedDown = true;
        });

        $('#saveOfCustomerDiet').on('click',saveOfCustomerDiet);

        dietMeal.selectedIndexChanged.addHandler((s,e)=>{
            let item = dietMeal.selectedItem;
            $('#dietMenu').text(item.didMenu);       //추천메뉴
            $('#dietRealMenu').val(item.dexMenu);   //실제메뉴
            
            dietImageInit();    //이미지 초기화 

            if(!wijmo.isNullOrWhiteSpace(item.dexPfile)){
                // let imageUrl = `http://localhost:8081/rest-api/image-view/${item.dexPfile}`
                let imageUrl = `rest-api/image-view/diet/${item.dexPfile}`
                $('#profile-img .dz-preview').html(
                    `<div class="dz-preview-cover d-flex align-items-center justify-content-center mb-3 mb-md-0">
                        <div class="avatar avatar-5xl"><img class="rounded-circle" src="${imageUrl}" alt="..." data-dz-thumbnail="data-dz-thumbnail" /></div>
                        <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress=""></span></div>    
                    </div>`
                );

            }
            
            
        })
        
    }




    return{
        init:()=>{
            handleEvent();
            calendarInit();
            search();
        }
    }
}();

$(()=>{
    mypage.init();
    
});
