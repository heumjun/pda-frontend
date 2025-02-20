import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const health = function(){

    let healthCodeGrid = new GridFactory('#healthCodeGrid');
    let detailCodeGrid = new GridFactory('#detailCodeGrid');
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    
    /**
     * 운동리스트 그리드 초기화
     */
    const healthCodeGridInit = ()=>{
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'count',header:'운동상세수',width:80,dataType:'Number',isReadOnly:true,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
                    click:(e,ctx)=>{
                        $('#selectedHealthCode').text(ctx.item.hemName);
                        $('#selectedHealthCode').data('healthCode',ctx.item.hemCode);
                        
                        loadDetailCode();
                    }
                })
            },
            {binding:'hemName',header:'운동명',width:'*',dataType:'String',maxLength:100},
            {binding:'hemIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true,},
            {binding:'hemUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true,},
            {binding:'hemRegName',header:'등록자',width:60,dataType:'String',isReadOnly:true,align:'center'},
            
        
        ];

        healthCodeGrid.setColumnsDefinition(columnsDefinition);
        healthCodeGrid.setDynamicHeight(670);
        healthCodeGrid.optionPanel('#healthCodeGrid-option')
        healthCodeGrid.checkBoxColumns(["select"]);
        healthCodeGrid.enableFrozenCol('cohName');

        let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
        healthCodeGrid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType === wijmo.grid.CellType.ColumnHeader){
                let column = s.columns[e.col];

                switch (column.binding) {
                    case 'hemName':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>운동명:</b><br>운동명을 입력하세요.');
                        break;
                    default:
                        break;
                }
            }
        });

    }
    /**
     * 운동리스트 그리드 이벤트
     */
    const healthCodeGridEvent = ()=>{
        healthCodeGrid._flexCv.getError = (item,prop)=>{

            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(healthCodeGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'hemName':
                    if(wijmo.isNullOrWhiteSpace(item.hemName)) return '[운동명]을 입력하세요.';
                    if(item.hemName.getBytes()>100) return `[운동명]는 100byte 이하로 입력하세요.(${item.hemName.getBytes()})`;
                    if(healthCodeGrid.isSameColumnValue(item,['hemName'])) return '중복되는 [운동명]이 존재합니다.';
                    break;
                
                default:
                    break;
            }
        }
        
    }


    
    /**
     * 운동 리스트
     */
    const getHealthList = async ()=>{

        healthCodeGrid.disableAutoRows();

        let params = {
            uri: `code-manage/healths`
        }
        await ajax.getAjax(params,true).then((data)=>{
            let healthList = data['healthList'];
            healthList.forEach(item=>item.select = false);

            healthCodeGrid._flexCv.sourceCollection = healthList;
            pushMsg(`${healthCodeGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 운동리스트 저장
     */
    const saveOfHealthCode = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        healthCodeGrid.disableAutoRows();

        if(!healthCodeGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = healthCodeGrid.gridItemListToArray(healthCodeGrid._flexCv.itemsAdded);
        let itemsEdited = healthCodeGrid.gridItemListToArray(healthCodeGrid._flexCv.itemsEdited);

        let saveList = [...itemsAdded,...itemsEdited];

        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            let params = {
                uri: `code-manage/healths`,
                saveList: saveList
            }

            ajax.postAjax(params,true).then(async ()=>{
                await getHealthList();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 운동리스트 삭제
     */
    const deleteOfHealthCode = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        healthCodeGrid.disableAutoRows();

        let checkList = healthCodeGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        if(checkList.some(item=>item.count>0)){
            alertInfo('삭제불가','등록된 운동 상세가 존재합니다.');
        return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(healthCodeGrid._flexCv.itemsAdded.some(f=>f.hemName==item.hemName)){
                healthCodeGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('선택된 운동을 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/healths`,
                deleteList: deleteList
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                await getHealthList();
                pushMsg('선택된 내역이 삭제되었습니다.');
                
            }).catch((e)=>{});
            
        });

    }

    /**
     * 운동상세 그리드 초기화
     */
    const detailCodeGridInit = ()=>{

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'hedOrder',header:'순서',width:50,dataType:'Number',isReadOnly:true,align:'center'},
            {binding:'hedExecise',header:'종목',width:150,dataType:'String',maxLength:50},
            {binding:'hedBody',header:'신체부위',width:100,dataType:'String',maxLength:50},
            {binding:'hedCycle',header:'루틴',width:200,dataType:'String',maxLength:200},
            {binding:'hedLock',header:'사용중지',width:70,dataType:wijmo.DataType.Boolean,align:'center', cssClass:'switch'},
            {binding:'hedIndte',header:'등록일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'hedUpdte',header:'수정일자',width:80,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'hedRegName',header:'등록자',width:80,dataType:'String',isReadOnly:true,align:'center'}
            
        ];

        detailCodeGrid.setColumnsDefinition(columnsDefinition);
        detailCodeGrid.setDynamicHeight(660);
        detailCodeGrid.checkBoxColumns(["select"]);
        detailCodeGrid.manualColumnsSorting([],false);    //sort 금지 드레그 해서 순서변경을 위해
        detailCodeGrid.enableMoveRow();   //그리드 행이동 가능토록

        let tooltip = new wijmo.Tooltip();  //툴팁객체 생성
        detailCodeGrid._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel.cellType === wijmo.grid.CellType.ColumnHeader){
                let column = s.columns[e.col];

                switch (column.binding) {
                    case 'hedExecise':
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>종목:</b><br>운동할 종목명을 입력하세요.');
                        break;
                    case 'hedBody'    :
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>신체부위:</b><br>운동 신체 부위를 입력하세요.');
                        break;
                    case 'hedCycle'    :
                        wijmo.toggleClass(e.cell,'wj-has-notes',true);      //셀메모 모양css
                        tooltip.setTooltip(e.cell,'<b>루틴:</b><br>운동 방법/세트를 입력하세요.');
                        break;
                    
                    default:
                        break;
                }
            }
        });
     
    }
    /**
     * 공통코드 그리드 이벤트
     */
    const detailCodeGridEvent = ()=>{
        
        detailCodeGrid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(detailCodeGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'hedExecise':
                    if(wijmo.isNullOrWhiteSpace(item.hedExecise)) return '[종목]을 입력하세요.';
                    if(item.hedExecise.getBytes()>50) return `[종목]는 50자 이하로 입력하세요.(${item.codName.getBytes()})`;
                    if(detailCodeGrid.isSameColumnValue(item,['hedExecise'])) return '중복되는 [종목]이 존재합니다.';
                    break;
                case 'hedBody':
                    if(wijmo.isNullOrWhiteSpace(item.hedBody)) return '[신체부위]을 입력하세요.';
                    if(item.hedBody.getBytes()>50) return `[신체부위]는 50자 이하로 입력하세요.(${item.codName.getBytes()})`;
                    break;    
                case 'hedCycle':
                    if(wijmo.isNullOrWhiteSpace(item.hedCycle)) return '[실행]을 입력하세요.';
                    if(item.hedCycle.getBytes()>200) return `[실행]는 200자 이하로 입력하세요.(${item.codName.getBytes()})`;
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
    const detailCodeUpDownEvent = (e)=>{
        detailCodeGrid.disableAutoRows();
        let selectRow = detailCodeGrid._flexGrid.selection.row;
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
                if(selectRow==detailCodeGrid.getRowCnt()-1) return;
                moveRow = selectRow+1;
                break;
            case 'last':
                if(selectRow==detailCodeGrid.getRowCnt()-1) return;
                moveRow = detailCodeGrid.getRowCnt()-1;
            default:
                break;
        }

        //deferupdate 여러데이터를 일괄적으로 변경할경우 사용
        //내부적으로 데이터를 변경할동안 업데이트를 일시 중시시키고 변경된후에 한번만 업데이트하여 성능최적화함.
        let arr = detailCodeGrid._flexCv.sourceCollection;
        detailCodeGrid._flexCv.deferUpdate(()=>{
            let item = arr[selectRow];
            arr.splice(selectRow,1);        //선택된 행 삭제
            arr.splice(moveRow,0,item);     //선택된 행 이동될 row에 복사
            detailCodeGrid._flexCv.moveCurrentToPosition(moveRow);   //이동된 행으로 선택옮기기
        });

    }

    /**
     * 운동상세 조회
     */
    const loadDetailCode = async ()=>{

        let code = $('#selectedHealthCode').data('healthCode');
        
        if(wijmo.isNullOrWhiteSpace(code)){
            alertInfo('조회불가','운동을 선택하세요.');
            return;
        }

        let params = {
            uri: `code-manage/healths/details`,
            code: code,
        };

        await ajax.getAjax(params,true).then((data)=>{
            
            let detailCodeList = data['healthDetailList'];
            
            detailCodeList.forEach(item=>{
                item.select = false;
                //hedLock 널값이면 'N'으로 초기화해주고 'Y'라면 true 아니면 false
                item.hedLock = (item.hedLock || 'N') === 'Y' ? true :false;
            });

            detailCodeGrid._flexCv.sourceCollection =  detailCodeList;
            pushMsg(`${detailCodeGrid.getRowCnt()}행이 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 공통코드 저장
     */
    const saveOfDetailCode = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        detailCodeGrid.disableAutoRows();

        let code = $('#selectedHealthCode').data('healthCode');
        
        if(wijmo.isNullOrWhiteSpace(code)){
            alertInfo('저장불가','선택된 운동이 없습니다.');
            return;
        }

        if(!detailCodeGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        //차례로 순번을 재정렬(순서지정 변경할경우 순번이 생성되지만 순서 지정변경없이 추가 되었을경우 순번이 없음.)
        detailCodeGrid._flexGrid.rows.forEach((row,index)=>{
            detailCodeGrid._flexGrid.setCellData(index,'hedOrder',index+1);
        });
        
        //추가/수정된 내역이 있을경우 
        let itemsAdded = detailCodeGrid.gridItemListToArray(detailCodeGrid._flexCv.itemsAdded);
        let itemsEdited = detailCodeGrid.gridItemListToArray(detailCodeGrid._flexCv.itemsEdited);
        let saveList = [...itemsAdded,...itemsEdited];

        

        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장 하시겠습니까?', '추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{

            //true/false 데이터를 Y,N변경 
            //신규데이터가 있기때문에 선택된 지점, 코드를 넣어준다.
            saveList.forEach(item=>{
                item.hedLock =  item.hedLock?'Y':'N';
                item.hedHcode = code;
            });

            let params = {
                uri: `code-manage/healths/details`,
                saveList: saveList
            };

            ajax.postAjax(params,true).then(async ()=>{
                await loadDetailCode();
                await getHealthList();
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});

        });
    }

    /**
     * 공통코드 삭제
     */
    const deleteOfDetailCode = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        detailCodeGrid.disableAutoRows();

        let checkList = detailCodeGrid.getCheckList('select');
        if(wijmo.isEmpty(checkList)){
            alertInfo('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(detailCodeGrid._flexCv.itemsAdded.some(f=>f==item)){
                detailCodeGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;


        confirm('상세 운동내역를 삭제 하시겠습니까?','다른 프로그램과 연동되어 있을경우 삭제시 문제가 발생합니다.',consts.MSGBOX.ERROR,()=>{
            
            let params = {
                uri: `code-manage/healths/details`,
                deleteList: deleteList
            };
            ajax.deleteAjax(params,true).then(async ()=>{
                await loadDetailCode();
                pushMsg('선택된 내역이 삭제되었습니다.');
            }).catch((e)=>{});
            
        });
    }



    /**
     * 각종 이벤트 핸들러
     */
    const handleEvent = ()=>{
        healthCodeGridInit();
        healthCodeGridEvent();
        detailCodeGridInit();
        detailCodeGridEvent();
        
        $('.btn-healthCode-refresh').on('click',getHealthList);
        $('#btn-healthCode-save').on('click',saveOfHealthCode);
        $('#btn-healthCode-add').on('click',()=>{
            healthCodeGrid.enableAutoRows();
            healthCodeGrid.moveFocus(healthCodeGrid.getRowCnt(),'hemName');
        });
        $('#btn-healthCode-delete').on('click',deleteOfHealthCode);
        

        $('.btn-detailCode-refresh').on('click',loadDetailCode);
        $('#btn-detailCode-add').on('click',()=>{
            detailCodeGrid.enableAutoRows();
            detailCodeGrid.moveFocus(detailCodeGrid.getRowCnt(),'hedExecise');
        });
        $('#btn-detailCode-save').on('click',saveOfDetailCode);
        $('#btn-detailCode-delete').on('click',deleteOfDetailCode);

        //메뉴 순서지정 버튼들 이벤트
        $('[data-up-down]').on('click',detailCodeUpDownEvent);
        
    }

    return{
        init:()=>{
            handleEvent();
            getHealthList();
        }
    }
}();


$(()=>{
    health.init();
    
})
