import * as modal from "./modal.js";
import * as ajax from "./ajax.js";
import * as dateUtils from "./dateUtils.js";


/**
 * server side 에서 tree데이터(부모,자식 코드가 존재하는)가 있는 배열일경우
 * 이를 javascript Object 형태로 변경해줌.
 * @param {Object} array tree데이터
 * @param {String} node 노드 이름
 * @param {String} upNode 부모 노드이름
 * @returns 
 */
export const treeToObject = (array,node,upNode)=>{
    let map = new Array();
    map['-'] = {children:[]};
    
    array.forEach(item=>{
        let obj = {...item};    //원본데이터 유지하기위해 새로운 object 복사
        
        obj.children = new Array();
        map[obj[node]] = obj;
        
        if(!map[item[upNode]]){
            map['-'].children.push(obj);
        }else{
            // '||' 문법은 앞에 변수가  false, 0, '', null, undefined 일경우 뒤 변수가 초기화됨.
            let parent = item[upNode] || '-';
            if(!map[parent]){
                map[parent]={
                    children:[]
                };
            }
            map[parent].children.push(obj);
        }
    });
    return map['-'].children;
}

export const menuLoad = ()=>{

    $("#nav-menu").html("");
    // let menu2 = [
    //     {menCode:'INFO',menName:'정보관리',menUpcd:'ROOT',menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:2},
    //     {menCode:'INFO_MENU',menName:'메뉴관련업무',menUpcd:'INFO', menIcon:'fas fa-file-alt',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/23', menSeq:1,level:3},
    //     {menCode:'INCOEN01',menName:'메뉴관리',menUrl:'info/menu/menu',menUpcd:'INFO_MENU',menIcon:null,menLock:'N', menIndte:'2023-05-19',	menUpdte:'2023/05/20', menSeq:1,level:4}
    // ]
    
    let params = {
        uri: `system/menus/0000/children`,
    }

    ajax.getAjax(params,true).then((data)=>{
        
        let menu = data['menuList'];

        if(wijmo.isEmpty(menu)) return;

        let menuTree = treeToObject(menu,'code','upcode');
        // console.debug(menuTree);
        
        let sss = ` <div class="row navbar-vertical-label-wrapper mt-1 mb-2">
						<div class="col-auto navbar-vertical-label">DENSO PDA</div>
						<div class="col ps-0">
							<hr class="mb-0 navbar-vertical-divider">
						</div>
					</div>`;
					
        sss += renderTree(menuTree[0].children);
        $("#nav-menu").html(sss);

        //collapse 에서 펼치기로 설정된 엘리먼트 가져온다.
        let collapseElementList = $('.nav-link[aria-expanded=true]');
        //루프를 돌면서 펼치기로 설정되어 있는 자식의 id값을 가져와서 collapse('show')를 사용하여 풀어준다.
        collapseElementList.map((index,element)=>{
            let parentId = $(element).attr('aria-controls');
            $(`#${parentId}`).collapse('show');
        });

        //siteMap(menuTree[0].children);
        
    }).catch((e)=>{});

    
}

export const renderTree = (child)=>{
    let sss = "";
    let expanded = false;

    child.forEach(item => {
        expanded = false;
        if(wijmo.isEmpty(item.children)){
            
            //새창띄우기 버튼 삽입으로 위코드에서 아래코드로 변경함.
            sss += `<li class="nav-item">
                        <a class="nav-link" href="view?view=${item.uri}&title=${item.name}&authUrl=${item.uri}" data-path="${item.name}"}>
							<div class="d-flex align-items-center">
								<i class="${item.icon}"></i><span class="nav-link-text ps-1">${item.name}</span>
							</div>
                        </a>
                    </li>`;
        } else {
            //level 2인 항목만 펼치기 한다. 
            if(item.level==2) expanded = true;

			sss += `<li class="nav-item">
                        <a class="nav-link dropdown-indicator" href="#MENU${item.code}" role="button" data-bs-toggle="collapse" aria-expanded="${expanded}" aria-controls="${item.code}">
                            <div class="d-flex align-items-center">`;
            
            if(!wijmo.isNullOrWhiteSpace(item.icon)) 
                sss += `        <span class="nav-link-icon"><span class="${item.icon}"></span></span>`;
            	sss += `        <span class="nav-link-text ps-1">${item.name}</span>
                            </div>
                        </a>
                    </li>
                    <ul class="nav collapse show" id="MENU${item.code}">
                        ${renderTree(item.children)}
                    </ul>`;
        }

    });
    return sss;
}