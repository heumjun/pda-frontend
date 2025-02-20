/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/dhtmlx/codebase/dhtmlx.d.ts"/>

import * as ajax from "./common/ajax.js";
import {treeToObject } from "./common/common.js";
import {JQUERYEVENT} from "./common/constants.js";

const index = function(){
    
    const documentElement = document.documentElement;
    let tabbar = new dhtmlXTabBar("cont");

    // 탭활성화시 타이틀 표시
    let typed = new Typed("#menuTitle",{
        strings: ["대시보드"],
        typeSpeed: 30
        //cursorChar: '.'
    });

    
    // 대시보드 탭 추가
    const initTabbar = ()=>{
        let role = $('#data-params').data('params').userInfo.role;
        let title = "대시보드";
        let id = "dashboard/dashboard";
        
        if(role=='USER_ROLE'){
            title = "마이페이지"
            id = "user/mypage"; 
        }

        let urlId = `view?view=${id}&title=${title}&authUrl=${id}`;
        tabbar.addTab(id,title,"150px");
        tabbar.cells(id).attachURL(urlId);
        tabbar.tabs(id).setActive();

        //새로운 탭일경우 타이틀
        typed.strings = [title];
        typed.reset(true);


        resizeContents();
        
    }

    /**
     * 브라우저 사이즈 조절시 사이즈 조정
     */
    const resizeContents = ()=>{
        let navBarWidth =$('#navbar').width()+50;  //메뉴바 사이즈
        let topBarHeight = 100; //상단 메뉴 사이즈
        
        //메뉴바 줄임여부
        let navbarcollapsed = localStorage.getItem("isNavbarVerticalCollapsed");

        //최소화 될경우 100으로 맞춰줌. JSON으로 
        //파싱하는이유는 localstorage는 데이터 타입이Sting으로만 저장된다. 이를 javascript object형태로 역직렬화되어 원본데이터를 얻을수있음.
        if(JSON.parse(navbarcollapsed)) navBarWidth = 100;

        //화면사이즈가 줄어들경우 메뉴바가 없어짐 메뉴바 사이즈를 30으로 초기화
        let mq1 = window.matchMedia("screen and (max-width: 1200px)");
		if(mq1.matches){
			navBarWidth = 25;
		}
        
        //메뉴바가 최소화될때 100으로 맞춰줌.
        //if(navBarWidth==116) navBarWidth = 100;

        $('#cont').width($(window).width()-navBarWidth);  
		$('#cont').height($(window).height()-topBarHeight); 

        //tabbar 내용 사이즈
		$('.dhxtabbar_cont').width($(window).width()-navBarWidth);
		$('.dhxtabbar_cont').height($(window).height());
		
		//tabbar 탭사이즈
		$('.dhxtabbar_tabs').width($(window).width()-navBarWidth);
		$('.dhxtabbar_tabs_base').width($(window).width()-navBarWidth-30);

        //iframe 상위 영역
        $('.dhx_cell_tabbar').width($(window).width()-navBarWidth);
		$('.dhx_cell_tabbar').height($(window).height());
        
		//iframe 상위 영역
		$('.dhx_cell_cont_tabbar').width($(window).width()-navBarWidth);
		$('.dhx_cell_cont_tabbar').height($(window).height());
				
		//iframe
		$('iframe').width($(window).width()-navBarWidth);
		$('iframe').height($(window).height()-topBarHeight);
        
    }

    /**
     * 탭추가
     * @param {String} id 탭 id(url)
     * @param {String} name 탭 이름
     * @param {String} title 상위 title에 표기될 메뉴 경로
     */
    const addTabBar = (id,name,title)=>{
        
        let isSame = false; //동일한 아이디를 가진 탭이 존재하는지 여부

        tabbar.forEachTab((tab)=>{
            let tabId = tab.getId();
            
            //동일한 탭이 이미 있다면 그탭으로 포커스 이동
            if(tabId==id){
                tabbar.tabs(id).setActive();
                isSame = true;
            }
        });

        if(!isSame){
            //view: html 경로, title: 메뉴경로, authUrl: 권한관리 key값
            let url = `view?view=${id}&title=${title}&authUrl=${id}`;
            tabbar.enableTabCloseButton(true);
            tabbar.addTab(id,name,'150px');
            tabbar.cells(id).attachURL(url);
            tabbar.tabs(id).setActive();

            //새로운 탭일경우 타이틀
            typed.strings = [title];
            typed.reset(true);

        }

        resizeContents();

    }

    /**
     * 로그아웃
     */
    const logOut = ()=>{
        location.href ="/log-out";
    }

    

    const handleEvents = ()=>{
        
        //브라우저 사이즈 조절시 사이즈 조정함수 호출
        $(window).on("resize",resizeContents);

        //메뉴바 최소화 토글버튼 클릭시 사이즈 조정함수 호출
        $('.navbar-vertical-toggle').on('click',resizeContents);

        //tab 클릭시 resize해줘야함.
        //tabbar.attachEvent 에 resizeContents를 넣으니 페이지가 바뀌기 전에 이벤트가 호출되어 resizeContents가 안먹힘.
        $(document).on('click','.dhxtabbar_tab',resizeContents);

        //탭선택 이벤트 타이틀 표시
        tabbar.attachEvent("onSelect", (idNew, idOld)=>{
            
            //typed.strings = [tabbar.tabs(idNew).getText()]
            
            //선택되는 탭(iframe)의 title에 접근해서 title 표시
            let ifr = tabbar.tabs(idNew).getFrame();
            let title = ifr.contentWindow.document.title;
            if(title){
                typed.strings = [title]
            }

            typed.reset(true);
            return true; // allow selection
            
        });
        
        //메뉴 클릭시 이벤트
        $(document).on(JQUERYEVENT.CLICK,'.addTabBar',function(e){
            e.preventDefault(); //a 태그의 href를 막기위함.
            let id = $(this).attr('href');
            let name = $(this).text();

            let titleArray = $(this).data('path').split('>');
            let title = "";
            
            titleArray.forEach((value,index)=>{
                if(index > 1) title = title+" > ";
                if(index > 0) title = title + value;
            });

            addTabBar(id,name,title);

        });

        //새창띄우기 버튼
        $(document).on(JQUERYEVENT.CLICK,'.menuPop',function(e){
            let $element = $(this).parents('li').children('.addTabBar');
            let id = $element.attr('href');
            //let name = $element.text();

            let titleArray = $element.data('path').split('>');
            let title = "";
            
            titleArray.forEach((value,index)=>{
                if(index > 1) title = title+" > ";
                if(index > 0) title = title + value;
            });

            let posLeft=(screen.availWidth-690)/2;	//중앙위치산출
            let posTop=(screen.availHeight-890)/2;

	        window.open(`view?view=${id}&title=${title}&authUrl=${id}`,"",
    		        		  `toolbar=no, location=no, directories=no, status=yes, 
								  menubar=no, scrollbars=yes, resizable=no, width=1600, height=${screen.availHeight-200},top=${posTop} left=${posLeft}`);

        });

        

        $("#btn-logOut").on(JQUERYEVENT.CLICK,logOut);    //로그아웃

        //탭새로고침
        $('#refresh-tab').on('click',()=>{
            let tab = tabbar.getActiveTab();
            let ifr = tabbar.tabs(tab).getFrame();
            ifr.contentDocument.location.reload(true);
        });
        
        //전체화면 
        $('#fullscreen').on('click',()=>{
            if(document.fullscreenElement ===null){
                documentElement.requestFullscreen();
            }else{
                document.exitFullscreen();
            }
        });


    }

    const menuLoad = (menuCode)=>{

        $("#nav-menu").html("");
        // let menu2 = [
        //     {menCode:'INFO',menName:'정보관리',menUpcd:'ROOT',menLock:'N',menIcon:null,	menIndte:'2023-05-19',	menUpdte:'2023-05-22', menSeq:1, level:2},
        //     {menCode:'INFO_MENU',menName:'메뉴관련업무',menUpcd:'INFO', menIcon:'fas fa-file-alt',menLock:'N',	menIndte:'2023-05-19',	menUpdte:'2023/05/23', menSeq:1,level:3},
        //     {menCode:'INCOEN01',menName:'메뉴관리',menUrl:'info/menu/menu',menUpcd:'INFO_MENU',menIcon:null,menLock:'N', menIndte:'2023-05-19',	menUpdte:'2023/05/20', menSeq:1,level:4}
        // ]
        
        let params = {
            uri: `system/menus/${menuCode}/children`,
        }

        ajax.getAjax(params,true).then((data)=>{
            
            let menu = data['menuList'];

            if(wijmo.isEmpty(menu)) return;

            let menuTree = treeToObject(menu,'menCode','menUpcd');
            // console.debug(menuTree);
            
            let sss = ` <div class="row navbar-vertical-label-wrapper mt-3 mb-2">
                            <div class="col-auto navbar-vertical-label">${menuTree[0].menName}</div>
                            <div class="col ps-0">
                                <hr class="mb-0 navbar-vertical-divider" />
                            </div>
                        </div>`;
            sss += renderTree(menuTree[0].children);
            //console.debug(sss);
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

    /**
     * 메뉴 전체보기
     * @param {object} childs 
     */
    const siteMap = (childs)=>{

        const getChildren = (children)=>{
            let sss = "";    
            if(wijmo.isEmpty(children)) return sss;

            children.forEach(item=>{
                sss+=`<a class="addTabBar nav-link py-1 link-600 fw-medium" ${!wijmo.isNullOrWhiteSpace(item.menUrl)?`href="${item.menUrl}" data-path="${item.path}"`:``}>${item.menName}</a>`;
                
                if(!wijmo.isEmpty(children)) sss+=getChildren(item.children);
            });
            return sss;
        }

        let parent = "";
        
        childs.forEach((element,index) => {

            //sitemap 4컬럼으로 
            if(index%4==0){
                if(index > 0) parent += `</div>`;
                parent += `<div class="row">`;
            }
            let children = getChildren(element.children);
            //링크가 없는 부모메뉴
            let alink = `<a class="nav-link text-700 mb-0 fw-bold">${element.menName}</a>`;

            //부모메뉴이지만 링크가 있는경우
            if(!wijmo.isNullOrWhiteSpace(element.menUrl))
                alink = `<a class="nav-link text-700 mb-0 fw-bold addTabBar" href="${element.menUrl}" data-path="${element.path}">${element.menName}</a>`;

            parent+= `  <div class="col-6 col-lg-3 col-xxl-3">
                            <div class="nav flex-column">
                                ${alink}
                                ${children}
                            </div>
                        </div>`;

        });
        parent+=`</div>`;

        //console.debug(parent);
        $('#siteMap').html("").append(parent);

    }

    const renderTree = (child)=>{
        let sss = "";
        let expanded = false;

        child.forEach(item => {
            expanded = false;
            if(wijmo.isEmpty(item.children)){
                
                //새창띄우기 버튼 삽입으로 위코드에서 아래코드로 변경함.
                sss += `<li class="nav-item d-flex flex-between-center hover-actions-trigger">
                            <a class="nav-link addTabBar" ${!wijmo.isNullOrWhiteSpace(item.menUrl)?`href="${item.menUrl}" data-path="${item.path}"`:``}> `;
                if(!wijmo.isNullOrWhiteSpace(item.menIcon)) 
                    sss += `    <span class="nav-link-icon"><span class="${item.menIcon}"></span></span>`;

                sss += `        <span class="nav-link-text ps-1">${item.menName}</span>
                            </a>
                            <div class="hover-actions end-0">
                                <button class="btn fs--2 icon-item-sm btn-link px-0 text-600 menuPop"><span class="fas fa-external-link-alt text-light"></span></button>
                            </div>
                        </li>`
            }else{
                //level 2인 항목만 펼치기 한다. 
                if(item.level==2) expanded = true;
                
                sss += `<li class="nav-item">
                            <a class="nav-link dropdown-indicator" href="#${item.menCode}" role="button" data-bs-toggle="collapse" aria-expanded="${expanded}" aria-controls="${item.menCode}">
                                <div class="d-flex align-items-center">`;
                
                if(!wijmo.isNullOrWhiteSpace(item.menIcon)) 
                    sss += `        <span class="nav-link-icon"><span class="${item.menIcon}"></span></span>`;
                
                sss += `        <span class="nav-link-text ps-1">${item.menName}</span>
                                </div>
                            </a>
                        </li>
                        <ul class="nav collapse" id="${item.menCode}">
                            ${renderTree(item.children)}
                        </ul>`;
            }

        });
        return sss;
    }

    
    
    return{
        /**
         * 초기화
         */
        init:()=>{
            initTabbar();
            handleEvents();
            let role = $('#data-params').data('params').userInfo.role;
            menuLoad(role); 
            
        },
        addTabBar:(id,name,title)=>{
            addTabBar(id,name,title);
        }

        
        
    };
}();

/**
 * 다른 모듈에서 탭호출을 위한 함수
 * @param {String} id 탭ID
 * @param {String} name 탭이름
 * @param {String} title 타이틀
 */
export const addTabBar=(id,name,title)=>{
    index.addTabBar(id,name,title);
}

//문서 로딩후 시작점
$(()=>{
    index.init();
});

