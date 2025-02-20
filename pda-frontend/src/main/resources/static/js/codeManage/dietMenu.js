import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const dietMenu = function(){

    let dietMenuGrid = new GridFactory('#dietMenuGrid');
    let detailDietGrid = new GridFactory('#detailDietGrid');
    
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    /**
     * 식단리스트 그리드 초기화
     */
    const dietMenuGridInit = ()=>{
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'count',header:'식단상세수',width:80,dataType:'Number',isReadOnly:true,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
                    click:(e,ctx)=>{
                        $('#selectedDietMenu').text(ctx.item.dimName);
                        $('#selectedDietMenu').data('dietMenu',ctx.item.dimCode);
                        
                        loadDetailDiet();
                    }
                })
            },
            {binding:'dimName',header:'식단명',width:'*',dataType:'String',maxLength:100},
            {binding:'dimIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,},
            {binding:'dimUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,},
            {binding:'dimRegName',header:'등록자',width:60,dataType:'String',isReadOnly:true,align:'center'},
            
        
        ];

        dietMenuGrid.setColumnsDefinition(columnsDefinition);
        dietMenuGrid.setDynamicHeight(670);
        dietMenuGrid.optionPanel('#dietMenuGrid-option')
        dietMenuGrid.checkBoxColumns(["select"]);
        dietMenuGrid.enableFrozenCol('cohName');

        let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
        dietMenuGrid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType === wijmo.grid.CellType.ColumnHeader){
                let column = s.columns[e.col];

                switch (column.binding) {
                    case 'dimName':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>식단명:</b><br>식단명을 입력하세요.');
                        break;
                    default:
                        break;
                }
            }
        });

    }
    /**
     * 식단리스트 그리드 이벤트
     */
    const dietMenuGridEvent = ()=>{
        dietMenuGrid._flexCv.getError = (item,prop)=>{

            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(dietMenuGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'dimName':
                    if(wijmo.isNullOrWhiteSpace(item.dimName)) return '[식단명명]을 입력하세요.';
                    if(item.dimName.getBytes()>100) return `[식단명]는 100byte 이하로 입력하세요.(${item.dimName.getBytes()})`;
                    if(dietMenuGrid.isSameColumnValue(item,['dimName'])) return '중복되는 [식단명]이 존재합니다.';
                    break;
                
                default:
                    break;
            }
        }
        
    }


    
    /**
     * 식단 리스트
     */
    const getDietMenuList = async ()=>{

        dietMenuGrid.disableAutoRows();

        let params = {
            uri: `code-manage/diet-menus`
        }
        await ajax.getAjax(params,true).then((data)=>{
            let dietMenuList = data['dietMenuList'];
            dietMenuList.forEach(item=>item.select = false);

            dietMenuGrid._flexCv.sourceCollection = dietMenuList;
            pushMsg(`${dietMenuGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 식단리스트 저장
     */
    const saveOfDietMenu = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }

        dietMenuGrid.disableAutoRows();

        if(!dietMenuGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = dietMenuGrid.gridItemListToArray(dietMenuGrid._flexCv.itemsAdded);
        let itemsEdited = dietMenuGrid.gridItemListToArray(dietMenuGrid._flexCv.itemsEdited);

        let saveList = [...itemsAdded,...itemsEdited];

        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            let params = {
                uri: `code-manage/diet-menus`,
                saveList: saveList
            }

            ajax.postAjax(params,true).then(async ()=>{
                await getDietMenuList();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 식단리스트 삭제
     */
    const deleteOfDietMenu = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        dietMenuGrid.disableAutoRows();

        let checkList = dietMenuGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        if(checkList.some(item=>item.count>0)){
            alertInfo('삭제불가','등록된 식단 상세가 존재합니다.');
        return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(dietMenuGrid._flexCv.itemsAdded.some(f=>f==item)){
                dietMenuGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('선택된 식단을 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/diet-menus`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await getDietMenuList();
                pushMsg('선택된 내역이 삭제되었습니다.');
                
            }).catch((e)=>{});
            
        });

    }

    /**
     * 식단상세 그리드 초기화
     */
    const detailDietGridInit = ()=>{

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'didOrder',header:'순서',width:50,dataType:'Number',isReadOnly:true,align:'center'},
            {binding:'didMenu',header:'메뉴명',width:250,dataType:'String',maxLength:50},
            {binding:'didMeal',header:'식사',width:100,dataType:'String',maxLength:50,align:'center'},
            {binding:'didLock',header:'사용중지',width:70,dataType:wijmo.DataType.Boolean,align:'center', cssClass:'switch'},
            {binding:'didIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'didUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'didRegName',header:'등록자',width:80,dataType:'String',isReadOnly:true,align:'center'}
            
        ];

        detailDietGrid.setColumnsDefinition(columnsDefinition);
        detailDietGrid.setDynamicHeight(660);
        detailDietGrid.checkBoxColumns(["select"]);
        detailDietGrid.manualColumnsSorting([],false);    //sort 금지 드레그 해서 순서변경을 위해
        detailDietGrid.enableMoveRow();   //그리드 행이동 가능토록

        let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
        detailDietGrid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType === wijmo.grid.CellType.ColumnHeader){
                let column = s.columns[e.col];

                switch (column.binding) {
                    case 'didMenu':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>메뉴명:</b><br>식단의 메뉴명을 입력하세요.');
                        break;
                    case 'didMeal'    :
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>식사:</b><br>식사시간(아침,점심,저녁,간식등)을 입력하세요.');
                        break;
                    default:
                        break;
                }
            }
        });
     
    }
    /**
     * 식단 상세 그리드 이벤트
     */
    const detailDietGridEvent = ()=>{
        
        detailDietGrid._flexCv.getError = (item,prop)=>{

            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(detailDietGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'didMenu':
                    if(wijmo.isNullOrWhiteSpace(item.didMenu)) return '[메뉴]를 입력하세요.';
                    if(item.didMenu.getBytes()>50) return `[메뉴]는 50자 이하로 입력하세요.(${item.didMenu.getBytes()})`;
                    if(detailDietGrid.isSameColumnValue(item,['didMenu'])) return '중복되는 [메뉴]가 존재합니다.';
                    break;
                case 'didMeal':
                    if(wijmo.isNullOrWhiteSpace(item.didMeal)) return '[didMeal]을 입력하세요.';
                    if(item.didMeal.getBytes()>50) return `[didMeal]는 50자 이하로 입력하세요.(${item.didMeal.getBytes()})`;
                    break;    
                default:
                    break;
            }
        }

    }

    /**
     * 메뉴순서 지정 이벤트
     * @param {*} e 
     */
    const detailDietUpDownEvent = (e)=>{
        detailDietGrid.disableAutoRows();
        let selectRow = detailDietGrid._flexGrid.selection.row;
        let moveRow = 0;

        if(selectRow<0){
            alertInfo('작업불가','이동할 행을 선택후 작업하세요.');
            return;
        }
        
        let target = e.target;
        let action = $(target).data('upDown');

        switch (action) {
            case 'first':
                if(selectRow==0) return;
                moveRow = 0;
                break;
            case 'up':
                if(selectRow==0) return;
                moveRow = selectRow-1;
                break;
            case 'down':
                if(selectRow==detailDietGrid.getRowCnt()-1) return;
                moveRow = selectRow+1;
                break;
            case 'last':
                if(selectRow==detailDietGrid.getRowCnt()-1) return;
                moveRow = detailDietGrid.getRowCnt()-1;
            default:
                break;
        }

        //deferupdate 여러데이터를 일괄적으로 변경할경우 사용
        //내부적으로 데이터를 변경할동안 업데이트를 일시 중시시키고 변경된후에 한번만 업데이트하여 성능최적화함.
        let arr = detailDietGrid._flexCv.sourceCollection;
        detailDietGrid._flexCv.deferUpdate(()=>{
            let item = arr[selectRow];
            arr.splice(selectRow,1);        //선택된 행 삭제
            arr.splice(moveRow,0,item);     //선택된 행 이동될 row에 복사
            detailDietGrid._flexCv.moveCurrentToPosition(moveRow);   //이동된 행으로 선택옮기기
        });

    }

    /**
     * 식단 상세코드 조회
     * @param {String} code 
     */
    const loadDetailDiet = async ()=>{

        let code = $('#selectedDietMenu').data('dietMenu');
        
        if(wijmo.isNullOrWhiteSpace(code)){
            alertInfo('조회불가','식단을 선택하세요.');
            return;
        }

        let params = {
            uri: `code-manage/diet-menus/details`,
            code: code,
        };

        await ajax.getAjax(params,true).then((data)=>{
            
            let dietMenuDetailList = data['dietMenuDetailList'];
            
            dietMenuDetailList.forEach(item=>{
                item.select = false;
                //hedLock 널값이면 'N'으로 초기화해주고 'Y'라면 true 아니면 false
                item.didLock = (item.didLock || 'N') === 'Y' ? true :false;
            });

            detailDietGrid._flexCv.sourceCollection =  dietMenuDetailList;
            pushMsg(`${detailDietGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 식단상세 저장
     */
    const saveOfDetailDiet = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        detailDietGrid.disableAutoRows();

        let code = $('#selectedDietMenu').data('dietMenu');
        
        if(wijmo.isNullOrWhiteSpace(code)){
            alertInfo('저장불가','선택된 식단이 없습니다.');
            return;
        }

        if(!detailDietGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        //차례로 순번을 재정렬(순서지정 변경할경우 순번이 생성되지만 순서 지정변경없이 추가 되었을경우 순번이 없음.)
        detailDietGrid._flexGrid.rows.forEach((row,index)=>{
            detailDietGrid._flexGrid.setCellData(index,'didOrder',index+1);
        });
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = detailDietGrid.gridItemListToArray(detailDietGrid._flexCv.itemsAdded);
        let itemsEdited = detailDietGrid.gridItemListToArray(detailDietGrid._flexCv.itemsEdited);
        let saveList = [...itemsAdded,...itemsEdited];

        
        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            //true/false 데이터를 Y,N변경 
            //신규데이터가 있기때문에 선택된 지점, 코드를 넣어준다.
            saveList.forEach(item=>{
                item.didLock =  item.didLock?'Y':'N';
                item.didHcode = code;
            });

            let params = {
                uri: `code-manage/diet-menus/details`,
                saveList: saveList
            };

            ajax.postAjax(params,true).then(async ()=>{
                await loadDetailDiet();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 식단상세 삭제
     */
    const deleteOfDetailDiet = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        detailDietGrid.disableAutoRows();

        let checkList = detailDietGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(detailDietGrid._flexCv.itemsAdded.some(f=>f==item)){
                detailDietGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;


        confirm('식단 상세 내역를 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/diet-menus/details`,
                deleteList: deleteList
            };
            ajax.deleteAjax(params,true).then(()=>{
                loadDetailDiet();
                pushMsg('선택된 내역이 삭제되었습니다.');
            }).catch((e)=>{});
            
        });
    }



    /**
     * 각종 이벤트 핸들러
     */
    const handleEvent = ()=>{
        dietMenuGridInit();
        dietMenuGridEvent();
        detailDietGridInit();
        detailDietGridEvent();
        
        $('.btn-dietMenu-refresh').on('click',getDietMenuList);
        $('#btn-dietMenu-save').on('click',saveOfDietMenu);
        $('#btn-dietMenu-add').on('click',()=>{
            dietMenuGrid.enableAutoRows();
            dietMenuGrid.moveFocus(dietMenuGrid.getRowCnt(),'dimName');
        });
        $('#btn-dietMenu-delete').on('click',deleteOfDietMenu);
        

        $('.btn-detailDiet-refresh').on('click',loadDetailDiet);
        $('#btn-detailDiet-add').on('click',()=>{
            detailDietGrid.enableAutoRows();
            detailDietGrid.moveFocus(detailDietGrid.getRowCnt(),'didMenu');
        });
        $('#btn-detailDiet-save').on('click',saveOfDetailDiet);
        $('#btn-detailDiet-delete').on('click',deleteOfDetailDiet);

        //메뉴 순서지정 버튼들 이벤트
        $('[data-up-down]').on('click',detailDietUpDownEvent);
        
    }

    return{
        init:()=>{
            handleEvent();
            getDietMenuList();
        }
    }
}();


$(()=>{
    dietMenu.init();
    
})
