import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import {treeToObject,getTreeFindItem } from "../common/common.js";
import * as commonRestApi from "../common/commonRestApi.js";


const authority = function(){
    
    let menuTree = new wijmo.nav.TreeView('#menuTree');
    let insertGrid = new GridFactory('#insertGrid');

    let modalAuthCopySourceGrid = new GridFactory('#modalAuthCopySourceGrid');
    let modalAuthCopyDestGrid = new GridFactory('#modalAuthCopyDestGrid');

    
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    

    /**
     * 메뉴리스트 초기화 작업
     */
    const menuTreeInit = ()=>{
        menuTree.displayMemberPath = 'menName';
        menuTree.childItemsPath = 'children';
        menuTree.autoCollapse = false;  //다른 노드를 펼칠경우 기존열려있는 노드 줄이기 금지
        
        //트리 모두 펼치기
        menuTree.loadedItems.addHandler((s,e)=>{
            s.collapseToLevel(1000);
        });
        
        menuTree.formatItem.addHandler((s,e)=>{
            //사용중지 코드 
            if(e.dataItem.menLock==='Y'){
                e.element.textContent = e.element.textContent+" (사용중지)";
                e.element.classList.add('text-danger');
            }
            //메뉴에 아이콘이 있을경우 아이콘 표시붙이기
            if(e.dataItem.menIcon){
                let html = wijmo.createElement(`<span class='${e.dataItem.menIcon} ms-1'></span>`);
                e.element.appendChild(html);
                
            }
        });

        //메뉴 클릭시 이벤트
        menuTree.itemClicked.addHandler(loadAuthority);
    }

    /**
     * 메뉴 선택시 로딩
     */
    const loadAuthority = async ()=>{

        insertBtnInit();

        let obj = menuTree.selectedItem;

        if(wijmo.isNullOrWhiteSpace(obj)){
            alertInfo('메뉴를 선택후 작업하세요.');
            return;
        }

        $('#insertUrl').data('url',obj.menUrl);
        $('#insertUrl').text(obj.menUrl);
        
        if(wijmo.isNullOrWhiteSpace(obj.menUrl)) return;

        $('#btn-menu-add').prop('disabled',false);
        $('#btn-menu-save').prop('disabled',false);
        $('#btn-menu-delete').prop('disabled',false);    

        let params = {
            uri: `system/authorities`,
            menuUrl: obj.menUrl
        }
        await ajax.getAjax(params,true).then((data)=>{

            let authority = data['authority'];

            authority.forEach((item)=>{
                item.athIns = (item.athIns || 'N') === 'Y'? true:false        //Y,N으로 넘어온값을 true,false로 변경함.
                item.athDel = (item.athDel || 'N') === 'Y'? true:false        //Y,N으로 넘어온값을 true,false로 변경함.
                item.athLock = (item.athLock || 'N') === 'Y'? true:false        //Y,N으로 넘어온값을 true,false로 변경함.
                item.select = false;
            });

            insertGrid._flexCv.sourceCollection = authority;
            pushMsg(insertGrid.getRowCnt()+'행이 조회되었습니다.');
        }).catch((e)=>{});


    }

    /**
     * 권한등록 화면 버튼들 초기화
     */
    const insertBtnInit = ()=>{
        $('#insertUrl').data('url','');
        $('#insertUrl').text('');
        $('#btn-menu-add').prop('disabled',true);
        $('#btn-menu-save').prop('disabled',true);
        $('#btn-menu-delete').prop('disabled',true);

        insertGrid._flexCv.sourceCollection =[];

        insertGrid.disableAutoRows();

    }

    
    /**
     * 권한 등록 그리드 초기화
     */
    const insertGridInit = ()=>{
        
        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'athId',header:'권한자',width:200,dataType:'String',align:'left'},
            {binding:'athIns',header:'등록 권한',width:100,dataType:'Boolean',align:'center', cssClass:'switch'},
            {binding:'athDel',header:'삭제 권한',width:100,dataType:'Boolean',align:'center', cssClass:'switch'},
            {binding:'athLock',header:'사용중지',width:100,dataType:'Boolean',align:'center', cssClass:'switch'},
            {binding:'athIndte',header:'입력일자',width:100,dataType:'Date',align:'center',isReadOnly:true},
            {binding:'athUpdte',header:'수정일자',width:100,dataType:'Date',align:'center',isReadOnly:true},
            
        ];
        
        
        insertGrid.setColumnsDefinition(columnsDefinition);
        insertGrid.checkBoxColumns(['select']);
        insertGrid.optionPanel('#insertGrid-option');
        insertGrid.setDynamicHeight(600);
        
        insertGrid._flexCv.getError = (item,prop)=>{

            if(insertGrid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'athId':
                    if(wijmo.isNullOrWhiteSpace(item.athId)) return '[권한자]를 선택하세요.'
                        
                    if(insertGrid.isSameColumnValue(item,['athId'])) return '[권한자]가 중복됩니다.'
                    break;
                
            }
            
        }
        
    }
    
    /**
     * 메뉴리스트 반환
     */
    const getMenuList = ()=>{
        //권한관리에서는 사용자 메뉴는 권한관리를 하지 않음 (사용자들은 사용자 메뉴를 모두 사용해야하기때문에
        //관리자들만 메뉴권한 관리를 함.
        let params = {
            uri: `system/menus/ADMIN_ROLE/children`
        }

        ajax.getAjax(params,true).then((data)=>{
            let menu = data['menuList'];
            let treeObject = treeToObject(menu,'menCode','menUpcd');
            menuTree.itemsSource = treeObject;
            
        }).catch((e)=>{});
        
    }

    
    /**
     * 권한 등록
     * @returns 
     */
    const saveOfAuthority = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
       
        insertGrid.disableAutoRows();

        if(wijmo.isNullOrWhiteSpace($('#insertUrl').data('url'))){
            alertInfo('저장불가','메뉴를 선택하세요');
            return;
        }

        if(insertGrid.getRowCnt()< 1){
            alertInfo('저장불가','저장할 권한내역이 없습니다.');
            return;
        }

        if(!insertGrid.gridValidation()){
            alertInfo('저장불가','그리드 오류내역을 확인하세요.');
            return;
        }

        //추가/수정된 내역이 있을경우 
        let itemsAdded = insertGrid.gridItemListToArray(insertGrid._flexCv.itemsAdded);
        let itemsEdited = insertGrid.gridItemListToArray(insertGrid._flexCv.itemsEdited);
        let saveList = [...itemsAdded,...itemsEdited];
        if(wijmo.isEmpty(saveList)){
            alertInfo('저장불가','저장할 내역이 없습니다.');
            return;
        }

        confirm('저장하시겠습니까?','추가 및 수정된 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            
            saveList.forEach(item=>{
                item.athUrl = $('#insertUrl').data('url');
                item.athIns = (item.athIns||false)?'Y':'N';
                item.athDel = (item.athDel||false)?'Y':'N';
                item.athLock = (item.athLock||false)?'Y':'N';
            });
            console.debug(saveList);
            let params = {
                uri: `system/authorities`,
                saveList: saveList
            }
            
            ajax.postAjax(params,true).then((data)=>{
                pushMsg('저장 되었습니다.');
                loadAuthority();
            }).catch((e)=>{});
        });
        


    }
    
    /**
     * 권한삭제
     */
    const deleteOfAuthority = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
       
        insertGrid.disableAutoRows();

        let checkList = insertGrid.getCheckList('select');

        if(wijmo.isEmpty(checkList)){
            alertWarning('삭제불가','선택된 내역이 없습니다.');
            return;
        }

        //삭제할 내역중 추가된내역(itemsAdded 포함되어있는 내역)은 DB에 반영안된 내역으로 그냥 리스트에서 제거 하면 됨.
        //db에 있는 데이터를 걸러서 삭제 구문을 타게 한다.
        let deleteList = checkList.filter(item=>{
            if(insertGrid._flexCv.itemsAdded.some(f=>f==item)){
                insertGrid._flexCv.remove(item);
                return false;
            }
            return true;
        });

        if(wijmo.isEmpty(deleteList)) return;

        confirm('삭제하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.ERROR,()=>{
            
            if(!wijmo.isEmpty(deleteList)){
                let params = {
                    uri: `system/authorities`,
                    deleteList: deleteList
                };

                ajax.deleteAjax(params,true).then(async ()=>{
                    await loadAuthority();
                    pushMsg('선택된 내역이 삭제되었습니다.');
                }).catch((e)=>{});   
            }
        });

        
        
    }
    
    
    /**
     * 권한복사 복사대상
     */
    const modalAuthCopySourceGridInit = ()=>{

        let columnsDefinition = [
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'traId',header:'아이디',width:200,dataType:'String',isReadOnly:true},
            {binding:'traName',header:'이름',width:150,dataType:'String',isReadOnly:true,align:'center',},
            
        ]
        modalAuthCopySourceGrid.setColumnsDefinition(columnsDefinition);
        modalAuthCopySourceGrid.setDynamicHeight(450);
        modalAuthCopySourceGrid.createSearchBox('#modalAuthCopySource-search');

        //체크박스 하나만 선택하는 이벤트
        modalAuthCopySourceGrid._flexGrid.cellEditEnding.addHandler((s,e)=>{
            if(s.columns[e.col].binding=='select'){
                s.collectionView.items
                    .filter(f=>f.select)
                    .forEach(item=>item.select = false);
                s.collectionView.refresh();
            }
        });

        
    }
    /**
     * 권한 복사 적용대상
     */
    const modalAuthCopyDestGridInit = ()=>{

        let columnsDefinition = [
            
            {binding:'select',header:' ',width:30,dataType:'Boolean'},
            {binding:'traId',header:'아이디',width:200,dataType:'String',isReadOnly:true},
            {binding:'traName',header:'이름',width:150,dataType:'String',isReadOnly:true,align:'center',},
        ]
        modalAuthCopyDestGrid.setColumnsDefinition(columnsDefinition);
        modalAuthCopyDestGrid.setDynamicHeight(450);
        modalAuthCopyDestGrid.createSearchBox('#modalAuthCopyDest-search');
        
    }

    const copyAuthority = ()=>{
        $('#modalAuthCopy').modal('show');
        
        $('#modalAuthCopy').on('shown.bs.modal',async function(e){

            try {
                let {trainerList} = await commonRestApi.getTrainerList();

                //     //data['trainerList'] object 배열을 두개의 그리드 sourceCollection에 넣으면
                //     //얕은복사가 되어 두개의 그리드는 data['trainerList'] 값을 참조하게 된다.
                //     //둘중 하나의 그리드가 수정이되면 같이 동기화가 되어버림.
                //     //JSON.parse(JSON.stringify())를 사용해서 깊은 복사로 데이터를 새롭게 만들어 주입.
                let sourcelist = JSON.parse(JSON.stringify(trainerList));
                sourcelist.forEach(item=>item.select = false);
                let destlist = JSON.parse(JSON.stringify(trainerList));
                destlist.forEach(item=>item.select = false);

                modalAuthCopySourceGrid._flexCv.sourceCollection = sourcelist;
                modalAuthCopyDestGrid._flexCv.sourceCollection =  destlist;
                
            } catch (error) {
                console.debug(error);
            }
            
        });

    }

    /**
     * 권한 복사 등록
     */
    const saveOfAuthorityCopy = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
       
        let sourceCheckList = modalAuthCopySourceGrid.getCheckList('select');
        if(wijmo.isEmpty(sourceCheckList)){
            alertWarning('등록불가','복사대상을 선택 하세요.');
            return;
        }

        let descCheckList = modalAuthCopyDestGrid.getCheckList('select');
        if(wijmo.isEmpty(descCheckList)){
            alertWarning('등록불가','적용대상을 선택 하세요.');
            return;
        }

        let id = sourceCheckList[0].traId;
        let copyList = descCheckList.map(item=>item.traId);

        
        confirm('권한을 복사 하시겠습니까?','복사대상의 권한이 선택된 대상에 적용됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `system/authorities/copies`,
                id: id,
                copyList: copyList,
            };
            ajax.postAjax(params,true).then(data=>{
                pushMsg('복사 되었습니다.');

            }).catch(e=>{});
        });
    }

    /**
     * 각종 이벤트 핸들러
     */
    const handleEvent = async ()=>{

        menuTreeInit();
        insertGridInit();
        
        modalAuthCopySourceGridInit();
        modalAuthCopyDestGridInit();

        $('.btn-menu-refresh').on(consts.JQUERYEVENT.CLICK,getMenuList);
        $('#btn-menu-copy').on(consts.JQUERYEVENT.CLICK,copyAuthority);
        $('#btn-menu-save').on(consts.JQUERYEVENT.CLICK,saveOfAuthority);
        $('#btn-menu-add').on(consts.JQUERYEVENT.CLICK,()=>{
            insertGrid.enableAutoRows();
            insertGrid.moveFocus(insertGrid.getRowCnt(),'mnaLevel');
        });
        $('#btn-menu-init').on(consts.JQUERYEVENT.CLICK,loadAuthority);
        $('#btn-menu-delete').on(consts.JQUERYEVENT.CLICK,deleteOfAuthority);

        $('#btn-authority-copy').on(consts.JQUERYEVENT.CLICK,saveOfAuthorityCopy);

        try {
            let {trainerList} = await commonRestApi.getTrainerList();
            insertGrid._flexGrid.getColumn('athId').dataMap = new wijmo.grid.DataMap(trainerList,'traId','traName');
        }catch(error){
            console.debug(error);    
        }
        
    }

    return {
        init:()=>{
            
            handleEvent();
            getMenuList();
            
        }
    }
}();

$(()=>{
    authority.init();
})