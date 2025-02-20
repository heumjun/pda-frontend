
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const material = function(){
    
    let grid  = new GridFactory('#grid');
    let sdat = input.date('#sdat');
    let edat = input.date('#edat');
    let jcd = input.autoComplete('#jcd','matCode',commonRestApi.getMaterialCode,true);
    let lot = input.text('#lot',true);

    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{

        let code = input.autoComplete(document.createElement('div'),'matCode',commonRestApi.getMaterialCode,true);
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean',isRequired:false},
            {binding:'matCode',header:'코드',width:150,dataType:'String',align:'left',maxLength:50,editor:code},
            {binding:'matJil',header:'재질',width:70,dataType:'String',align:'center',maxLength:6,},
            {binding:'matHcd',header:'HCD',width:80,dataType:'String',align:'center',maxLength:3},
            {binding:'matUnit',header:'단위',width:80,dataType:'String',align:'center'},
            {binding:'matQty',header:'수량',width:130,dataType:'Number',editor:numberInput},
            {binding:'matStock',header:'보관장소',width:80,dataType:'String',align:'center'},
            {binding:'matIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'matUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(500);
        //체크박스 컬럼 생성
        grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
        //셀고정
        grid.enableFrozenCol('select');
        //키가되는 컬럼으로 변경이 되면 안되는 컬럼
        grid.disableReadOnlyForAutoRows(['matCode','matJil','matHcd']);
        //대문자로 변경하고싶은 컬럼
        grid.toUpperCase(['matCode','matJil','matHcd','matStock']);

        //unit데이터를 DB에서 받아와서 처리해야할경우 데이터를 받아와서 dataMap을 만들고 넣고자 하는 컬럼의 dataMap에 넣는다.
        let unit = [{key:'EA',name:'EA'},{key:'ME',name:'ME'},{key:'KG',name:'KG'}];
        grid._flexGrid.getColumn('matUnit').dataMap = new wijmo.grid.DataMap(unit,'key','name');


        //그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                case 'matCode':
                    if(wijmo.isNullOrWhiteSpace(item.matCode)) return '[코드]를 입력하세요.';
                    break;
                case 'matJil':
                    if(wijmo.isNullOrWhiteSpace(item.matJil)) return '[재질]를 입력하세요.';
                    break;
                case 'matHcd':
                    if(wijmo.isNullOrWhiteSpace(item.matHcd)) return '[HCD]를 입력하세요.';
                    if(grid.isSameColumnValue(item,['matCode','matJil','matHcd'])) return '코드,재질,HCD가 중복되는 내역이 존재합니다.';
                    break;
                default:
                    return null;
            }
        }
        
    }
    
    /**
     * 조회 함수
     */
    const searchOfMaterial = async ()=>{
        grid.disableAutoRows();
        
        let params = {
            uri: `materials`,
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {materialList} = await ajax.getAjax(params,true);  
            
            grid._flexCv.sourceCollection = materialList.map(item=>({...item,select:false}));

            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
            alertError('오류',error);
            return;
        }

    }

    const saveOfMaterial = ()=>{
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
                uri: `materials`,
                insertList: insertList,
                updateList: updateList,
            };
            ajax.postAjax(params,true).then(async (data)=>{
                
                await searchOfMaterial();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{
                console.debug(e);
            });
        });
    }
    /**
     * 그리드 선택된 내역 삭제
     * @returns 
     */
    const deleteOfMaterial = ()=>{
        grid.disableAutoRows();

        let checkList = grid.getCheckList('select');

        if(wijmo.isEmpty(checkList)){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(grid._flexCv.itemsAdded.some(f=>f==item)){
                grid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('삭제하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.ERROR,()=>{
            let params = {
                uri: `materials`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await searchOfMaterial();
                pushMsg('삭제 되었습니다.');
                
            }).catch((e)=>{});
        });
    }

    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#lot','#btn-search');
    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        gridInit();

        //추가버튼 클릭시
        $('#btn-add').on('click',()=>{
            grid.enableAutoRows();
        });

        $('#btn-search').on('click',searchOfMaterial);
        $('#btn-save').on('click',saveOfMaterial);
        $('#btn-delete').on('click',deleteOfMaterial);
        

    }


    return{
        init:()=>{
            handleEvent();
            handleFocus();
        }
    }
}();


$(()=>{
    material.init();
    
});
