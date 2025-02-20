import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
// import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const trainer = function(){

    let grid = new GridFactory('#grid');
    let searchName = input.text('#searchName');
    let searchStartEntdt = input.date('#searchStartEntdt');
    let searchEndEntdt = input.date('#searchEndEntdt');
    let searchStartTaedt = input.date('#searchStartTaedt');
    let searchEndTaedt = input.date('#searchEndTaedt');

    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    

    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
        
        let inputDate = input.date(document.createElement('div'));
        let dataMapSex =  new wijmo.grid.DataMap([{key:'M',name:'남자'},{key:'F',name:'여자'}], 'key', 'name');

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'traId',header:'아이디',width:100,dataType:'String',align:'left',isReadOnly:true,maxLength:20},
            {binding:'traName',header:'이름',width:80,dataType:'String',align:'center',maxLength:50,
                cellTemplate:(ctx)=>{
                    
                    //추가버튼 누를때 신규행이 생기는데 신규행일경우 item 값이 없음.
                    if (ctx.row instanceof wijmo.grid._NewRowTemplate) {
                        return;
                    }

                    //퇴사자 중앙라인 처리
                    let sss = ctx.value;
                    if(!wijmo.isNullOrWhiteSpace(ctx.item.traTaedt)){
                        sss = `<del class='text-danger'>${ctx.value}</del>`;
                    }
                    return sss;
                }
            },
            {binding:'traBirth',header:'생년월일',width:110,dataType:'Date',align:'center',editor:inputDate},
            {binding:'traSex',header:'성별',width:70,dataType:'String',align:'center',dataMap:dataMapSex},
            {binding:'traEntdt',header:'입사일자',width:110,dataType:'Date',align:'center',editor:inputDate},
            {binding:'traTaedt',header:'퇴사일자',width:110,dataType:'Date',align:'center',editor:inputDate,cssClass:'text-danger'},
            {binding:'traPhone',header:'전화번호',width:110,dataType:'String',align:'center',mask:'999-9999-9999'},
            {binding:'traEmail',header:'이메일',width:150,dataType:'String',align:'left',maxLength:50},
            {binding:'traAddress1',header:'주소',width:230,dataType:'String',align:'left',isReadOnly:false,
                cellTemplate:(ctx)=>{
                    return wijmo.glbz `
                        <div class="d-flex align-items-center">
                            <div class="w-85 text-truncate">${ctx.value}</div>
                            <div class="fas fa-search w-15 cursor-pointer" data-bs-toggle="modal" data-bs-target="#modalKakaoJuso"></div>
                        </div>
                    `
                }
            },
            {binding:'traAddress2',header:'상세주소',width:230,dataType:'String',align:'left',maxLength:100},
            {binding:'traRmk',header:'비고',width:200,dataType:'String',align:'left',maxLength:2000},
            {binding:'traIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'traUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,visible:false},
            {binding:'traRegid',header:'등록자',width:80,dataType:'String',align:'center',isReadOnly:true,visible:false},
            
        ];

        grid.setColumnsDefinition(columnsDefinition);
        grid.optionPanel('#grid-option');
        grid.setDynamicHeight(660);
        grid.checkBoxColumns(["select"]);
        grid.disableReadOnlyForAutoRows(['traId']);
        grid.enableFrozenCol('traName');

        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                case 'traId':
                    if(wijmo.isNullOrWhiteSpace(item.traId)) return '[아이디]를 입력하세요.';
                    if(commonFunc.iskorean(item.traId)) return '[아이디]는 한글을 포함 할수 없습니다.';
                    if(grid.isSameColumnValue(item,['traId'])) return '[아이디]가 중복 됩니다.';
                    break;
                case 'traName':
                    if(wijmo.isNullOrWhiteSpace(item.traName)) return '[이름]을 입력하세요.';
                    break;
                case 'traEntdt':
                    if(wijmo.isNullOrWhiteSpace(item.traEntdt)) return '[입사일자]를 입력하세요.';
                    break;
                case 'traEmail':
                    if(wijmo.isNullOrWhiteSpace(item.traEmail)) return '[이메일]을 입력하세요.';
                    const rgEx = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-za-z0-9\-]+/;
                    let OK = rgEx.test(item.traEmail)
                    if(!OK)
                        return '[이메일]형식에 맞게 입력하세요.';
                    break;
                case 'traPhone':
                    if(wijmo.isNullOrWhiteSpace(item.traPhone)) return '[전화번호]를 입력하세요.';
                    if(!wijmo.isNullOrWhiteSpace(item.traPhone)){
                        const rgEx = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-[0-9]{3,4}-[0-9]{4}$/;
                        let OK = rgEx.test(item.traPhone);
                        if(!OK)
                            return '[전화번호]형식에 맞게 입력하세요.';
                    } 
                    break;
                
                                                    
                default:
                    return null;
            }
        }

        let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
        grid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType === wijmo.grid.CellType.ColumnHeader){
                let column = s.columns[e.col];

                switch (column.binding) {
                    case 'traId':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>아이디:</b><br>로그인에 필요한 아이디입니다.');
                        break;
                    case 'traEmail':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>이메일:</b><br>최초 아이디 등록시 임시비밀번호가 이메일로 발송됩니다.');
                        break;
                    default:
                        break;
                }
            }
        });
        
    }

    /**
     * 조회 함수
     */
    const search = async ()=>{
        
        grid.disableAutoRows();
        
        let params = {
            uri: `code-manage/trainers`
        }

        params = {...params,...ajax.getParams('#searchForm')};

        await ajax.getAjax(params,true).then(data=>{
            grid._flexCv.sourceCollection =  data['trainerList'].map(item=>({
                ...item,
                select:false
            }));
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 저장
     * @returns 
     */
    const saveOfTrainer = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        grid.disableAutoRows();

        if(!grid.gridValidation()){
            alertWarning('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
        let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);

        if(insertList.length<1 && updateList.length<1){
            alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?','추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `code-manage/trainers`,
                insertList: insertList,
                updateList: updateList,
            };
            ajax.postAjax(params,true).then(async data=>{
                await search()
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{
                console.debug(e);
            });
        });
        
    }

    /**
     * 삭제
     * @returns 
     */
    const deleteOfTrainer = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        grid.disableAutoRows();

        let checkList = grid.getCheckList('select');

        if(wijmo.isEmpty(checkList)){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }
        let deleteList = checkList.filter(item=>{
            if(grid._flexCv.itemsAdded.some(f=>f==item)){
                grid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('삭제 하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `code-manage/trainers`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await search();
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
        

    }
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        gridInit();
        
        $('#btn-search').on('click',search);
        $('#btn-add').on('click',()=>{
            grid.enableAutoRows();
            grid.moveFocus(grid.getRowCnt(),'traId');
        });
        $('#btn-save').on('click',saveOfTrainer);
        $('#btn-delete').on('click',deleteOfTrainer);

        $('#modalKakaoJuso').on('shown.bs.modal', modalKakaoJuso);

    }

      
    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#searchEndTaedt','#btn-search');
    }

    /**
     * 카카오 주소록
     */
    const modalKakaoJuso = ()=>{
        
        let element_wrap = document.querySelector('#modalKakaoJusoArea');
        
        new daum.Postcode({
            oncomplete:function(data){
                // 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.
                console.debug(data);
                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                let addr = ''; // 주소 변수
                
    
                //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    addr = data.roadAddress;
                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    addr = data.jibunAddress;
                }
                
                if(!wijmo.isNullOrWhiteSpace(data.buildingName)){
                    addr=`${addr} (${data.buildingName})`;
                }
                
                let row = grid._flexGrid.selection.row;
                grid._flexGrid.setCellData(row,'traAddress1',addr);
                
                $('#modalKakaoJuso').modal('hide');

                grid.moveFocus(row,'traAddress2');
    
                
            },
            width : '100%',
            height : '100%'
        }).embed(element_wrap);
    }


    return{
        init:()=>{
            handleEvent();
            handleFocus();
            search();
        }
    }
}();


$(()=>{
    trainer.init();
    
});
