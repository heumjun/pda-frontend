
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import {treeToObject,getTreeFindItem } from "../common/common.js";

const menu = function(){
    
    let menuTree = new wijmo.nav.TreeView('#menuTree');
    let menUpcd = input.text('#menUpcd',true);
    let menUpcdName = input.text('#menUpcdName',false);
    let menCode = input.text('#menCode',true);
    let menName = input.text('#menName',false);
    let menUrl = input.text('#menUrl');
    let menIcon = input.text('#menIcon',false);
    let menIndte = input.date('#menIndte');
    let menUpdte = input.date('#menUpdte');

    let menuSiblingsGrid = new GridFactory('#menuSiblingsGrid');

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
        menuTree.itemClicked.addHandler(loadMenu);
    }

    /**
     * 메뉴 순서 그리드 초기화
     */
    const menuSiblingsGridInit = ()=>{
        let columnsDefinition = [
            {binding:'menCode',header:'코드',width:100,dataType:'String',align:'center'},
            {binding:'menName',header:'메뉴명',width:200,dataType:'String'},
            {binding:'menSeq',header:'순서',width:70,dataType:'Number',align:'center',[consts.wijmoColumns.visible]:false}
        ]
        menuSiblingsGrid.setColumnsDefinition(columnsDefinition);
        menuSiblingsGrid.setHeight(400);
        menuSiblingsGrid.manualColumnsSorting([],false);    //sort 금지 드레그 해서 순서변경을 위해
        menuSiblingsGrid.enableMoveRow();   //그리드 행이동 가능토록
        menuSiblingsGrid.isReadOnly();
        
    }

    /**
     * 메뉴리스트 트리 클릭시 메뉴 정보 로딩
     * @param {treeView} 선택된 메뉴 정보
     */
    const loadMenu = ()=>{
        
        btnMenuInitEvent();

        let obj = menuTree.selectedItem;

        let parentName="";
        //부모가 있을경우
        if(menuTree.selectedNode.parentNode){
            parentName = menuTree.selectedNode.parentNode.dataItem.menName;

            // 같은 레벨의 메뉴를 순서조정하는 그리드에 입력
            let siblingNode = menuTree.selectedNode.parentNode.dataItem.children;
            menuSiblingsGrid._flexCv.sourceCollection = siblingNode;    
        } 
        
        menCode.text =  obj.menCode;
        menCode.isReadOnly = true;
        menName.text = obj.menName;
        menUpcd.text = obj.menUpcd;
        menUpcdName.text = parentName;
        menUrl.text = obj.menUrl;
        menIcon.text = obj.menIcon;
        menIndte.value = obj.menIndte;
        menUpdte.value = obj.menUpdte;
        if(obj.menLock==='Y') $('#menLock').prop('checked',true);
        
        $('#btn-menu-add').prop('disabled',false);
        $('#btn-menu-save').prop('disabled',false);
        $('#btn-menu-delete').prop('disabled',false);

        

    }

    /**
     * 메뉴 등록 input박스들 초기화
     */
    const btnMenuInitEvent = ()=>{
        $('#btn-menu-add').prop('disabled',true);
        $('#btn-menu-save').prop('disabled',true);
        $('#btn-menu-delete').prop('disabled',true);

        menCode.text =  ""
        menCode.isReadOnly = true;
        menName.text = "";
        menUpcd.text = "";
        menUpcdName.text = "";
        menUrl.text = "";
        menIcon.text = "";
        menIndte.value = null;
        menUpdte.value = null;
        $('#menLock').prop('checked',false);

        menuSiblingsGrid._flexCv.sourceCollection = [];

    }

    /**
     * 추가버튼 이벤트
     */
    const btnMenuAddEvent = ()=>{
        
        menUpcd.text=menCode.text 
        menUpcdName.text = menName.text;
        menCode.isReadOnly = false;
        menCode.text = "";
        menName.text = "";
        menUrl.text = "";
        menIcon.text = "";
        menIndte.value = null;
        menUpdte.value = null;
        $('#menLock').prop('checked',false);
        
    }
    /**
     * 메뉴순서 지정 이벤트
     * @param {*} e 
     */
    const menuUpDownEvent = (e)=>{

        let selectRow = menuSiblingsGrid._flexGrid.selection.row;
        let moveRow = 0;

        if(selectRow<0){
            alertInfo('작업불가','이동할 행을 선택후 작업하세요.');
            return;
        }
        
        let target = e.target;
        let action = $(target).data('upDown');  //data- 태그 다음에 오는 '-' 부터는 camel표기법으로 접근

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
                if(selectRow==menuSiblingsGrid.getRowCnt()-1) return;
                moveRow = selectRow+1;
                break;
            case 'last':
                if(selectRow==menuSiblingsGrid.getRowCnt()-1) return;
                moveRow = menuSiblingsGrid.getRowCnt()-1;
            default:
                break;
        }

        //deferupdate 여러데이터를 일괄적으로 변경할경우 사용
        //내부적으로 데이터를 변경할동안 업데이트를 일시 중시시키고 변경된후에 한번만 업데이트하여 성능최적화함.
        let arr = menuSiblingsGrid._flexCv.sourceCollection;
        menuSiblingsGrid._flexCv.deferUpdate(()=>{
            let item = arr[selectRow];
            arr.splice(selectRow,1);        //선택된 행 삭제
            arr.splice(moveRow,0,item);     //선택된 행 이동될 row에 복사
            menuSiblingsGrid._flexCv.moveCurrentToPosition(moveRow);   //이동된 행으로 선택옮기기
        });
        
    }

    /**
     * 메뉴등록시 validation
     */
    const menuValidation = ()=>{

        let params = {
            rules:{
                menUpcd:{required : true},
                menCode:{required: true},
                menName:{required: true},
            }
        }
        input.inputValidate('#menu-form',params);

    }
    
    /**
     * 메뉴 저장
     */
    const saveOfMenu = ()=>{
        if(!authrity.ins){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        //validation 체크
        if(!$('#menu-form').valid()){
            return false;
        }

        let menuInfo = ajax.getParams('#menu-form');
        // if(menuInfo.menLock) menuInfo.menLock = "Y";
        // else menuInfo.menLock = "N";

        menuInfo.menLock =  menuInfo.menLock?'Y':'N';

        //차례로 순번을 재정렬(순서지정 변경할경우 순번이 생성되지만 순서 지정변경없이 추가 되었을경우 순번이 없음.)
        menuSiblingsGrid._flexGrid.rows.forEach((row,index)=>{
            menuSiblingsGrid._flexGrid.setCellData(index,'menSeq',index+1);
        });
        
        let params = {
            uri: `system/menus`,
            isUpdateMode: menCode.isReadOnly,   //수정등록 여부(메뉴코드가 readonly면 수정임.)
            menuInfo: menuInfo,
            menuOrderList: menuSiblingsGrid.gridItemListToArray(menuSiblingsGrid._flexCv.itemsEdited)
        }
        
        console.debug(params);

        confirm('저장 하시겠습니까?','내용이 등록되며 변경하신 메뉴순서도 자동반영됩니다.',consts.MSGBOX.QUESTION,()=>{

            ajax.postAjax(params,true).then(async ()=>{
                await getMenuList();
                btnMenuInitEvent();
                pushMsg('등록 되었습니다.');
            }).catch((e)=>{});
            
        });
        
    }

    /**
     * 메뉴 삭제
     */
    const deleteOfMenu = ()=>{
        if(!authrity.del){
            alertWarning('작업불가','권한이 없습니다.');
            return;
        }
        if(wijmo.isNullOrWhiteSpace(menCode.text)){
            alertInfo('삭제불가','삭제할 내역을 선택하세요.');
            return;
        }

        if(menCode.text==='ROOT'){
            alertInfo('삭제불가','최상위 메뉴는 삭제 할 수 없습니다.');
            return;
        }

        if(menuTree.selectedNode.hasChildren){
            alertInfo('삭제불가','자식노드가 있어 삭제가 불가능합니다.');
            return;
        }

        confirm('삭제 하시겠습니까?', '선택된 내역이 삭제 됩니다.',consts.MSGBOX.ERROR,()=>{

            let params = {
                uri: `system/menus`,
                menuCode: menCode.text
            }
            
            ajax.deleteAjax(params,true).then(async ()=>{
                await getMenuList();
                btnMenuInitEvent();
    
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
    }

    /**
     * 메뉴리스트 반환
     */
    const getMenuList = async ()=>{
        /*
        let menu2 = [
            {menCode:'ROOT',menName:'메뉴',menUpcd:null,menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:1},
            {menCode:'INFO',menName:'정보관리',menUpcd:'ROOT',menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:2},
            {menCode:'INFO_MENU',menName:'메뉴관련업무',menUpcd:'INFO', menIcon:'fas fa-file-alt',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/23', menSeq:1,level:3},
            {menCode:'INCOEN01',menName:'메뉴관리',menUrl:'info/menu/menu',menUpcd:'INFO_MENU',menIcon:null,menLock:'N', menIndte:'2023-05-19',	menUpdte:'2023/05/20', menSeq:1,level:4}
        ]

        let menu = [
            {menCode:'ROOT',menName:'메뉴',menUpcd:null,menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:1},
            {menCode:'ACC',menName:'경리관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:1, level:1,path:' > 경리관리'},
            {menCode:'ACC_CODE',menName:'코드관련업무',menUpcd:'ACC', menIcon:'fas fa-file-alt',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:1,level:2,path:' > 경리관리 > 코드관련업무'},
            {menCode:'ACOOEN02',menName:'계정과목관리',menUrl:'acc/account',menUpcd:'ACC_CODE',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:1,level:3,path:' > 경리관리 > 코드관련업무 > 계정과목관리'},
            {menCode:'ACOOEN03',menName:'법인카드관리',menUrl:'acc/card',menUpcd:'ACC_CODE',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:2,level:3,path:' > 경리관리 > 코드관련업무 > 법인카드관리'},
            {menCode:'ACC_CUST',menName:'거래처 관리',menUpcd:'ACC_CODE',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:3,level:3,path:' > 경리관리 > 코드관련업무 > 거래처 관리'},
            {menCode:'ACOEN04',menName:'거래처 등록',menUpcd:'ACC_CUST',menUrl:'acc/customer/ins',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:1,level:4,path:' > 경리관리 > 코드관련업무 > 거래처 관리 > 거래처 등록'},
            {menCode:'ACOEN05',menName:'거래처 조회',menUpcd:'ACC_CUST',menUrl:'acc/customer/search',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:2,level:4,path:' > 경리관리 > 코드관련업무 > 거래처 관리 > 거래처 조회'},
            {menCode:'PEO',menName:'인사관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:2,level:1,path:' > 인사관리'},
            {menCode:'PEO_A',menName:'사번관리',menUpcd:'PEO',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:1,level:2,path:' > 인사관리'},
            {menCode:'MAR',menName:'영업관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:3,level:1,path:' > 영업관리'},
            {menCode:'MAN',menName:'생산관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:4,level:1,path:' > 생산관리'},
            {menCode:'PRO',menName:'물류관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:5,level:1,path:' > 물류관리'},
            {menCode:'MAT',menName:'자재관리',menUpcd:'ROOT',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/19', menSeq:6,level:1,path:' > 자재관리'}
            
        ];
        */

        let params = {
            uri: 'system/menus'
        }

        await ajax.getAjax(params,true).then((data)=>{
            let menu = data['menuList'];
            let treeObject = treeToObject(menu,'menCode','menUpcd');
            menuTree.itemsSource = treeObject;
            //menuSearchgrid._flexCv.sourceCollection = treeObject;

            //params.uri = 'code-manage/menus/'+menu[1].menCode;

            pushMsg('조회 되었습니다.');
        }).catch((e)=>{});
        
    }

    
    /**
     * 포커스 이동 이벤트
     */
    const focusEvent = ()=>{
        
        input.nextFocusEvent('#menIcon','#btn-menu-save');
        
    }

    /**
     * 각종 이벤트 핸들러
     */
    const handleEvent = ()=>{

        menuTreeInit();
        menuSiblingsGridInit();
        btnMenuInitEvent();
        menuValidation();
        focusEvent();

        $('.btn-menu-refresh').on(consts.JQUERYEVENT.CLICK,getMenuList);
        
        $('#btn-menu-init').on(consts.JQUERYEVENT.CLICK,btnMenuInitEvent);
        $('#btn-menu-add').on(consts.JQUERYEVENT.CLICK,btnMenuAddEvent);
        $('#btn-menu-save').on(consts.JQUERYEVENT.CLICK,saveOfMenu);
        $('#btn-menu-delete').on(consts.JQUERYEVENT.CLICK,deleteOfMenu);

        //메뉴 순서지정 버튼들 이벤트
        $('[data-up-down]').on(consts.JQUERYEVENT.CLICK,menuUpDownEvent);

        

    }

    return {
        init:()=>{
            
            handleEvent();
            getMenuList();
        }
    }
}();

$(()=>{
    menu.init();
})