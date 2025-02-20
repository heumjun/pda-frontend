/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.filter.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.xlsx.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.pdf.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.grouppanel.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.selector.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.search.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.grid.cellmaker.d.ts"/>

/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.input.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.xlsx.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.pdf.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.barcode.common.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.touch.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.nav.d.ts"/>

/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.chart.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.chart.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.chart.animation.d.ts"/>

/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.olap.d.ts"/>
/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.undo.d.ts"/>


import {EditHighlighter} from "./editHighlighter.js";

/**
 * 그리드 클래스
 */
export default class GridFactory{
	
	#fullWindowHeight = 837; //풀화면시 윈도우 사이즈
	#gridFilter;
	
	/**
     * 
     * @param {selector} obj 그리드 selector ('#id')
     */
	constructor(obj){
		this._flexGrid = new wijmo.grid.FlexGrid(obj);
		this._flexCv = new wijmo.collections.CollectionView(null);
		this.#init();
	 	this.#handlerInitEvent();
		
	}
	
	/**
	 *  그리드 초기화 (객체 생성시 자동실행됨.)
	 */
	#init(){
		this._flexGrid.itemsSource = this._flexCv;
		this._flexGrid.autoGenerateColumns = false;								//컬럼명자동화
		this._flexGrid.autoClipboard = true;									//복사,붙여넣기 활성화
		this._flexGrid.keyActionEnter = wijmo.grid.KeyAction.MoveDown;			//엔터키액션 (None, MoveDown,MoveAcross,Cycle,CycleOut)
		this._flexGrid.keyActionTab = wijmo.grid.KeyAction.CycleOut;  			//탭키액션 (None, MoveDown, MoveAcross,Cycle,CycleOut)
		this._flexGrid.allowSorting=  wijmo.grid.AllowSorting.MultiColumn; 		//멀티정렬 (0없음, 1컬럼하나,2컬럼범위, 3모두)
		this._flexGrid.isReadOnly = false;										//그리드 전체 readonly
		this._flexGrid.columnHeaders.rows.defaultSize = 30; 					// 열 헤더 영역에 행의 높이 설정
		this._flexGrid.rowHeaders.columns.defaultSize = 40;						// 행 헤더 컬럼사이즈
		this._flexGrid.imeEnabled= true;										//한글입력기 사용
		this._flexGrid.alternatingRowStep = 1;									//행별 색상넣기
		this._flexGrid.allowMerging = wijmo.grid.AllowMerging.All			    // allowMerging = true 컬럼만 자동병합

		//flexGrid.selectionMode = "CellRange";									//선택블럭(default), (None,Cell,Row,RowRange,ListBox)
		//flexGrid.rows.defaultSize = 50;										// 스크롤 가능한 영역에 행의 높이 설정
		//flexGrid.cloneFrozenCells = false;									//스크롤시 깜빡임 줄이기
		this._flexGrid.bigCheckboxes = true;					                //체크박스 필드일경우 체크가 아니라 셀을 클릭해도 체크박스 전환됨.
		//this._flexGrid.stickyHeaders = true;					                //header 스크롤시 고정 (화면 아래로 내려갈때)
		this._flexGrid.allowDelete = false;										//del 키 누를경우 행 삭제기능
		this._flexGrid.autoSearch =true;						                //해당컬럼이 읽기속성일경우(isReadOnly:true) 해당컬럼에서 자판을 칠경우 빠른 찾기됨.(한글안됨)					
		this._flexGrid.allowResizing = wijmo.grid.AllowResizing.Both;           //컬럼,행 사이즈 조절가능
		this._flexGrid.showMarquee = true;										//셀선택시 셀라인만 표시 (엑셀스타일)
		this._flexGrid.showSelectedHeaders = wijmo.grid.HeadersVisibility.All;	//셀선택시 해당셀의 컬럼헤드,로우헤드에 선택색상표시
		//컬랙션뷰 데이터 추적 활성화
		this._flexCv.trackChanges =true;

	}
	
	/**
     * 그리드 이벤트 초기화 (객체 생성시 자동 호출됨.)
     * private method
	 */
	#handlerInitEvent(){
		
		/**
		자동 row height 설정 ==> 필드옵션에 "wordWrap: true" 있는것만 작동함.  
		아래 내용은 컬럼이 내용이 수정될때 데이터 수가 많을경우 시간이 오래걸리는데 비동기 방식으로 화면이 보여질때 리사이징하여 속도를 개선시킴 
		그리드 내용이 많지 않을때는 autoRowHeights= true 만사용해도 됨. 
		
		**********컬럼수가 많을경우 속도 저하로 일단 주석 처리함********
		
		this._flexGrid.loadedRows.addHandler((s,e)=>{
			this.autoSizeRowsAsync();
		})
		
		//컬럼 조절시 행 자동조절
		this._flexGrid.resizedColumn.addHandler((s,e)=>{
			if(s.columns[e.col].wordWrap) {
				this.autoSizeRowsAsync();
				this._flexGrid.autoSizeRow(0,true);  //head명 자동조절
			}
		});
		
		//셀수정후 행 자동 크기조정
		this._flexGrid.cellEditEnded.addHandler((s,e)=>{
			if(s.columns[e.col].wordWrap) {
				this.autoSizeRowsAsync(e.row);
			}
		});
		
        
		//스크롤 이동시 아래 크기조정되지 않는 아래 그리드 부분 크기조정
		this._flexGrid.scrollPositionChanged.addHandler((s,e)=>{
			if(s.rows.length>0){
				let vr = s.viewRange;
				for (let r = vr.topRow; r <= vr.bottomRow; r++) {
					if (s.rows[r].height == null) {
						s.autoSizeRows(r, r);
					}
				}
			}
		});
		*/
		
		//row heaer에 순번 붙이기
		this._flexGrid.itemFormatter = (p,r,c,cell)=>{	//(panel, 행인덱스, 열인덱스, 셀html요소)
			if(p.cellType == wijmo.grid.CellType.RowHeader){
				cell.textContent =  (this._flexCv.pageSize * this._flexCv.pageIndex + r + 1).toString();
			}
		}
		// 위 itemFormatter를 formatItem으로 변경할경우 아래와 같은 코드가 된다.
		// itemFormatter, formatItem의 차이점은크게 사용방식, 호출타이밍, 유연성에 있다.
		// itemFormatter: 함수할당방식, 셀이 렌더링될때 호출, 간단히 포맷팅 할때
		// formatItem: 이벤트핸들러방식, 셀이 렌더링된 후 호출, 복잡한 조작이 필요한경우

		// this._flexGrid.formatItem.addHandler((s,e)=>{	//(s:grid,e: FormatItemEventArgs 객체. 여기에는 panel, row, col, cell 등의 정보가 포함)
		// 	if(e.panel.cellType===wijmo.grid.CellType.RowHeader){
		// 		e.cell.textContent = (this._flexCv.pageSize * this._flexCv.pageIndex + e.row + 1).toString();
		// 	}
		// })
        
		
		//datamap을 사용하는 필드에서 키보드 동작을 막기위한 코드 (e.data.type 확인해야함)
		// this._flexGrid.beginningEdit.addHandler((s,e)=>{
		// 	if(e.data && e.data.type == "keypress" && s.columns[e.col].dataMap){
		// 		e.cancel = true;
		// 	}
		// });

		//컬럼 사이즈 조절시 선택된 모든 컬럼 자동조절 (엑셀처럼)
		this._flexGrid.resizedColumn.addHandler((s,e)=>{
			
			s.selectedRanges.forEach(value=>{
				//row2=선택된 셀종료 index, row=선택된 셀시작index
				//시작과 끝이 그리드 전체 행이라면 = 전체선택일때
				if(value.row2-value.row+1 == s.rows.length){
					//value.col2 선택된 시작컬럼, value.col	선택된 종료컬럼
					for(let j = value.col2; j<=value.col; j++){
						s.columns[j].width = s.columns[e.col].width;
					}
				}	
			});
			
		});

		//그리드 데이터를 수정할경우 해당셀 색상표시
		let editHighlighter = new EditHighlighter(this._flexGrid,'bg-soft-danger');

		//되돌리기 기능
		let undoStack = new wijmo.undo.UndoStack(`#${this._flexGrid.hostElement.id}`,{
			maxActions:50,
		});
		undoStack.undoingAction.addHandler((s,e)=>{
			syncWithEditHighlighter(s,e,editHighlighter._cellChanging,'GridEditAction');
		});
		undoStack.redoingAction.addHandler((s,e)=>{
			syncWithEditHighlighter(s,e,editHighlighter._cellChanging,'GridEditAction');
		});
		undoStack.undoneAction.addHandler((s,e)=>{
			syncWithEditHighlighter(s,e,editHighlighter._cellChanged,'GridEditAction');
		});
		undoStack.redoneAction.addHandler((s,e)=>{
			syncWithEditHighlighter(s,e,editHighlighter._cellChanged,'GridEditAction');
		});

		//undo, redo 액션에 대한 변화를 추적하여 editHighLighter의 적잘한 메서드를 호출할 함수
		// editHighlighter, undoStack을 같이 사용할경우 그리드 셀을 변경하면 붉은색으로 셀이 변경되는데
		// ctrl+z(되돌리기) 할경우 값은 예전값으로 변경되지만 붉은색으로 변경된 셀 색상이 복귀안됨.
		// https://dev.mescius.co.kr/bbs/board.php?bo_table=wijmo_qna&wr_id=2968&page=1 
		// 문의 내용을 구현함.
		const syncWithEditHighlighter = (s,e,callback,actionName)=>{
			if(e.action.constructor.name===actionName && e.action.range){
				//액션에 대한 콜백 호출
				callback.call(editHighlighter,this._flexGrid,new wijmo.grid.CellRangeEventArgs(this._flexGrid.cells,e.action.range));
				
				if(e.action._actions){
					for (let index = 0; index < e.action._actions.length; index++) {
						callback.call(
						  editHighlighter,
						  this._flexGrid,
						  new wijmo.grid.CellRangeEventArgs(
							this._flexGrid.cells,
							e.action._actions[index].range
						  )
						);
					}
				}
			}
		}

		//잘라내기 기능구현
		//위즈모에서는 ctrl+x 잘라내기 기능이 구현되지 않음
		//ctrl+x 잘라내기 할경우 클립보드에 내용을 넣고 잘라내기 
		this._flexGrid.hostElement.addEventListener('keydown',(e)=>{
			//잘라내기 ctrl+x 누를경우
			if(e.ctrlKey && e.key.toLocaleLowerCase()==='x'){
				//선택된 셀을 클립보드에 넣을수있는 string 형태로 가져옴.
				let selectedData = this._flexGrid.getClipString();

				//브라우저의 클립보드에 데이터를 복사함.
				//navigator.clipboard.writeText(selectedData);
				wijmo.Clipboard.copy(selectedData);
				//복사후 삭제
				this._flexGrid.setClipString('');
				
			}
		});
		
		/**
		 * 크롬 브라우저 접근성 강화로 인해 개발자 도구에 아래의 오류가 뜸.
		 * Blocked aria-hidden on a <input> element because the element that just received focus must not be hidden from assistive technology users. 
		 * Avoid using aria-hidden on a focused element or its ancestor.  
		 * Consider using the inert attribute instead, which will also prevent focus.
		 * For more details, see the aria-hidden section of the WAI-ARIA specification at https://w3c.github.io/aria/#aria-hidden. 
		 * 
		 * aria-hidden=true 코드가 위즈모에서 자동으로 생성되어 뜨는 오류로 aria-hidden 속성을 찾아서 삭제해줌.
		 * 
		 * Wjmo 2023 v1(5.20231.888)버전부터는 headerFocusability = 3 속성으로 해결되나, 우리가 사용하는버전은 이전버전임으로
		 * 아래와 같이 처리함.
		 */
		this._flexGrid.refreshing.addHandler((s,e)=>{
			let elements = s.hostElement.querySelectorAll('[aria-hidden]');
			elements.forEach((e)=>{
				e.removeAttribute('aria-hidden');
			});
		})

		
		/*grid값이 기본 소수점 두째짜리 반올림(n2 format을 따른다.) 하지만 값 그대로 넣고 싶을경우 사용
		ex) 원래 DB에 들어있는 데이터 값이 12.568799 값이라고 치면 grid 필드옵션에서 format:n3으로 주면 12.569로
		소수점 3자리에서 반올림된 값이 표시된다.
		format 옵션을 주지 않으면 grid는 기본 n2 format을 따르므로 12.57로 표시된다. 하지만 반올림하지 않고
		고유 원래값을 표시하는 이벤트
		==> g10, G10 format값을 주면 본래값으로 표연됨 단,자바스크립트허용치 소수점10자리까지만. (콤마가 없어짐.)
		
		this._flexGrid.formatItem.addHandler((s,e)=>{
		    if(s.editRange){
		        return;
		    }
			
			//특정필드만 적용시
		    if(s.cells===e.panel && s.columns[e.col].binding==='sales'){  //원래값 표시하고자하는 필드이름
		        let value = e.panel.getCellData(e.row,e.col,false);
		        e.cell.textContent = value;
		    }
			
			//number 컬럼 모두 적용시
			if(s.cells===e.panel && s.columns[e.col].dataType==wijmo.DataType.Number){
				let value = e.panel.getCellData(e.row,e.col,false);
		        e.cell.textContent = value;
			}
		
		});
        
		*/
	}

	/**
	 * 같은 값일경우 모든 셀 병합
	 */
	allMerging(){
		this._flexGrid.mergeManager = new CustomMergeManager();
	}

	/**
	 * 그리드 옵션판넬 초기화
	 * 컬럼그룹, 컬럼필터만
	 */
	optionPanelInit(){
		let gridId = this._flexGrid.hostElement.id;

		//컬럼그룹이 활성화 된 상태라면 초기화
		if($(`#${gridId}ColumnGroup`).hasClass('btn-falcon-primary')){
			$(`#${gridId}ColumnGroup`).trigger('click');
		}
		//필터기능이 활성화된 상태라면 초기화
		if($(`#${gridId}Filter`).hasClass('btn-falcon-primary')){
			$(`#${gridId}Filter`).trigger('click');
		}
	}
	
	/**
	 * 그리드 옵션 판낼 및 이벤트 생성
	 * @param{element} 옵션 판넬이 들어갈 element
	 */
	//<button id="${gridId}Pdf" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="PDF 다운로드"><span class="far fa-file-pdf"></span></button>
	optionPanel(element){
		//그리드 옵션박스
		let gridId = this._flexGrid.hostElement.id;
        let options = `
            <button id="${gridId}columnPicker" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="열선택기"><span class="fas fa-sun"></span></button>
            <button id="${gridId}ColumnGroup" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="컬럼그룹"><span class="fas fa-object-group"></span></button>
			<button id="${gridId}Filter" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="컬럼필터"><span class="fas fa-filter"></span></button>
			<button id="${gridId}Pinning" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="핀고정"><span class="fas fa-thumbtack"></span></button>
			<button id="${gridId}FrozenCols" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="열고정"><span class="fas fa-grip-lines-vertical"></span></button>
            <button id="${gridId}FrozenRows" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="행고정"><span class="fas fas fa-grip-lines"></span></button>
            <button id="${gridId}ColumnSelectionMod" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="컬럼선택"><span class="fab fa-microsoft"></span></button>
            <button id="${gridId}Paging" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="페이징"><span class="fas fa-list-ol"></span></button>
			<button id="${gridId}Excel" class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="tooltip" data-bs-placement="top" title="엑셀 다운로드"><span class="far fa-file-excel"></span></button>
			<div id="${gridId}Pdf" class="dropdown">
				<div data-bs-toggle2="tooltip" data-bs-placement="top" title="PDF 다운로드">
					<button class="btn btn-falcon-default btn-sm ms-1 ms-sm-2" type="button" data-bs-toggle="dropdown" aria-expanded="false"><span class="far fa-file-pdf"></span></button>
					<div class="dropdown-menu dropdown-toggle-item border py-2" aria-labelledby="ticket-layout"><a class="dropdown-item cursor-pointer ${gridId}Pdf" data-orientation=0 >세로출력</a><a class="dropdown-item cursor-pointer ${gridId}Pdf" data-orientation=1 >가로출력</a></div>
				</div>
			</div>
			<div id="${gridId}Search" class='ms-2 d-none d-lg-inline-block'></div>
                          
			`;

		$(element).append(options);

		//툴팁이 동적으로 생성되었기 때문에 툴팁초기화 함수를 다시 호출한다.(theme.js에 정의 되어있음.)
		tooltipInit();

		//페이징 처리부분 생성
		this.enablePaging();
		
		
		//컬럼선택기 영역생성
		let pickerId = `${gridId}ColumnPickerArea`;
		let pickerArea = `<div class='d-none'><div id='${pickerId}' class='column-picker'></div></div>`;
		
		$(`#${gridId}`).before(pickerArea);
		
		let theColumnPicker=new wijmo.input.ListBox(`#${pickerId}`,{
			//itemsSource: this._flexGrid.columns,
			itemsSource: this._flexGrid.columns.filter((col)=>col.binding != 'select'),	//첫열의 컬럼선택 컬럼인 select는 제외한다.
			checkedMemberPath: 'visible',
	        displayMemberPath: 'header',
	        lostFocus: function () {
	            wijmo.hidePopup(theColumnPicker.hostElement);
	        }
		});

		/**
		 * 열선택기
		 * 컬럼을 선택하여 보이기 숨기기 가능함.
		 */
		$(document).on('click',`#${gridId}columnPicker`,(e)=>{
			
			let ref = document.querySelector(`#${gridId}columnPicker`);
			let host = theColumnPicker.hostElement;
			if (!host.offsetHeight) {
				wijmo.showPopup(host, ref, false, true, false);
				theColumnPicker.focus();
			}
			else {
				wijmo.hidePopup(host, true, true);
				flexGrid.focus();
			}
			e.preventDefault();
	        
		});
		
		//컬럼 그룹 이벤트 생성
		$(document).on("click","#"+gridId+"ColumnGroup",(e)=>{
			
			let obj = $(e.target);

			if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this.disableGroupPanel();
				
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this.enableGroupPanel();
				
			}
			
		});
		
		
		//컬럼전체선택
		$(document).on("click","#"+gridId+"ColumnSelectionMod",(e)=>{
            let obj = $(e.target);
			
            if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this.disableColumnSelectionMod();
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this.enableColumnSelectionMod();
			}

		});
		
		
		//컬럼필터
		$(document).on("click",`#${gridId}Filter`,(e)=>{
            let obj = $(e.target);
			
            if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this.disableFilterColumns();
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this.enableFilterColumns();
			}

		});

		//핀고정
		$(document).on('click',`#${gridId}Pinning`,(e)=>{
			let obj = $(e.target);
            if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this._flexGrid.allowPinning = wijmo.grid.AllowPinning.None;
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this._flexGrid.allowPinning = wijmo.grid.AllowPinning.SingleColumn; 			//고정클립 (0없음, 1컬럼하나,2컬럼범위, 3모두)
			}
		});

		//행고정
		$(document).on("click","#"+gridId+"FrozenRows",(e)=>{
			let obj = $(e.target);
			
            if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this.disableFrozenRow();
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this.enableFrozenRow();
			}

		});
		
		//열고정
		$(document).on("click","#"+gridId+"FrozenCols",(e)=>{
			let obj = $(e.target);
			
            if(obj.hasClass('btn-falcon-primary')){
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				this.disableFrozenCol();
			}else{
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				this.enableFrozenCol();
			}
			
		});

		//그리드 엑셀변환
		$(document).on("click",`#${gridId}Excel`,(e)=>{
			this.exportExcel('export.xlsx');
		});

		//그리드 pdf 변환
		$(document).on("click",`.${gridId}Pdf`,(e)=>{
			//let orientation = $(e.target).attr('data-orientation');	//0: 세로출력(Portrait), 1: 가로출력(Landscape)
			let orientation = $(e.target).data('orientation');
			this.exportPdf('export.pdf',orientation);
		});

		//결과내 검색 필터기능
		new wijmo.grid.search.FlexGridSearch(`#${gridId}Search`,{
			placeholder:'결과 내 검색',
			grid:this._flexGrid
		});

		
		

	}

	/**
	 * 행 사이즈 조절
	 */
	autoSizeRowsAsync(rowIndex){
		
	    if (rowIndex != null) {
	    	this._flexGrid.rows[rowIndex].height = null;
	    }else{
			this._flexGrid.rows.forEach((row)=> {
	        	row.height = null;
	     	});
	    }
	    setTimeout(()=> {
	    	this._flexGrid.onScrollPositionChanged();
	    });
	    
	}

	
	/**
	 * row 삭제기능
	 * 0컬럼 선택후 del 키로 행 삭제 가능
	 */
	allowDelete(){
		this._flexGrid.allowDelete = true;
	}
	
	/**
	 * 집계row 생성
	 * 그리드 필드옵션에 aggregate: 'Sum' 추가하면 자동으로 footer에 합계 산출됨.
	 */
	allowAggregate(){
		this._flexGrid.columnFooters.rows.push(new wijmo.grid.GroupRow());
		this._flexGrid.bottomLeftCells.setCellData(0, 0, '\u03A3');
		//this._flexGrid.bottomLeftCells.setCellData(0, 0, '합계');
	}
	
	/**
	 * 집계row 그룹별 생성
	 * 그리드 조회 후 호출하면 footer에 그룹별 합계 산출
	 * @param{column} Group By 기준 컬럼명
	 * @param{column} 합계 컬럼명
	 * @param{boolean} true일경우 기준+합계를 한 셀에 표시
	 */
	allowAggregateGroup(groupByColumn, sumColumn, isMarge) {
		// 기존 footer 초기화
		this._flexGrid.columnFooters.rows.clear(); 

		// 그룹별 합계 구하기
		let groups = {};
		this._flexCv.items.forEach(item => {
			let groupKey = item[groupByColumn]; 
			if (!groups[groupKey]) {
				groups[groupKey] = 0;
			}
			groups[groupKey] += item[sumColumn];
		});
	
		let groupIndex = this._flexGrid.columns.findIndex(col => col.binding === groupByColumn);
		let sumIndex = this._flexGrid.columns.findIndex(col => col.binding === sumColumn);

		// 각 그룹별로 footer에 표시
		let footerData = [];
		Object.keys(groups).forEach((groupKey) => {
			// new row 추가
			this._flexGrid.columnFooters.rows.push(new wijmo.grid.GroupRow());

			// 콤마로 formatting
			let formattedSum = groups[groupKey].toLocaleString();

			// 그룹별로 footer에 표시
			this._flexGrid.columnFooters.setCellData(this._flexGrid.columnFooters.rows.length - 1, groupIndex, `${groupKey}`);
			this._flexGrid.columnFooters.setCellData(this._flexGrid.columnFooters.rows.length - 1, sumIndex, 
																				isMarge? `${groupKey} ${formattedSum}`: formattedSum);

			footerData.push({
					groupKey: groupKey,
					sum: groups[groupKey],
					formattedSum: formattedSum
			});
			
		});
		this._flexGrid.bottomLeftCells.setCellData(0, 0, '\u03A3');

		return footerData; //필요시 사용
	}

    /**
     * 컬럼에 체크박스 생성
	 * 만드려는 컬럼의 타입은 반드시 Boolean 이여야 한다.
	 * 첫컬럼의 열선택 컬럼을 만들경우 binding명을 select로 한다. => theColumnPicker 에서 제외 시키기 위함
     * @param {array} arrayCol 체크박스를 만들 컬럼배열  ex) ["a","b"]
     */
	checkBoxColumns(arrayCol){
		arrayCol.forEach(column=>{
			new wijmo.grid.selector.BooleanChecker(this._flexGrid.columns.getColumn(column))
		});
	}
	
	
	/**
	 * 드롭다운 edit 기능 비활성화
	 * 그리드 드롭다운 콤보박스란의 내용을 수정불가토록 하는 기능 (list 선택만 가능)
	 */
	disableDropDownEdit(){
        this._flexGrid.hostElement.addEventListener("keydown",(e)=>{
			//wijmo.closestClass: 지정된 요소에서 가장 가까운 상위요소를 찾는함수
			let dropDown = wijmo.closestClass(e.target,"wj-hasdropdown");
			if(dropDown){
				e.preventDefault();
			}
		},true);
		
	}

	/**
	 * 그리드 행고정 비활성
	 */
	disableFrozenRow(){
		this._flexGrid.frozenRows = 0;
	}
	
	/**
	 * 그리드 열고정 비활성
	 */
	disableFrozenCol(){
		this._flexGrid.frozenColumns = 0;
	}
	
	/**
	 * 컬럼 그룹판넬 비활성화
	 * 컬럼을 판넬에 드레그 하여 컬럼별 그룹화 할수있는 기능
	 */
	disableGroupPanel(){
		
		this._flexCv.groupDescriptions.clear();
		
		let gridId = this._flexGrid.hostElement.id;
		let pannelId = `${gridId}GroupPanel`;
		
		$(`#${pannelId}`).remove();

		this.setHeight( $(`#${gridId}`).height()+58);	//판넬사이즈 58
		
	}

	
	
	/**
 	 * 컬럼 전체행 선택 비활성화
 	 * 기본 정렬로 돌아감.	
	 */
	disableColumnSelectionMod(){
		this._flexGrid.allowSorting = wijmo.grid.AllowSorting.MultiColumn
		this._flexGrid.allowDragging= true; 			//컬럼헤드를 잡고 드레그 하면 이동가능
		this._flexGrid.selectionMod =  wijmo.grid.SelectionMode.None;
	}

	/**
	 * 필터 컬럼 비활성화
	 */
	disableFilterColumns(){
		//filter 객체가 생성되었다면
		if(!wijmo.isUndefined(this.#gridFilter)){
			this.#gridFilter.clear();
			this.#gridFilter.defaultFilterType = 0;
		}
		
	}

	/**
	 * 페이징 처리
	 * optionPanel 활성화시에는 자동호출되며 사용자가 수동으로 페이징을 선택가능함.
	 * 옵션판넬을 사용하지 않고 페이징만 필요로 할때 enablePaging(true)로 호출하여 만들어줄수있음.
	 * @param {boolean} isVisible 페이징처리 화면 보이기 여부
	 */
	enablePaging(isVisible = false){

		let gridId = this._flexGrid.hostElement.id;
		
		//페이징 처리
		let pagerId = gridId+"Pager";
		let pagerSizeId = pagerId+"Size";
		let pagerArea = `<div class='d-none d-flex flex-between-center'>
					 		<div id='${pagerId}'></div>
					 		<div class='ms-15'> 
					 			<select class='form-select form-select-sm' id='${pagerSizeId}'>
					 				<option value='15'>15</option>
					 				<option value='30'>30</option>
					 				<option value='50'>50</option>
					 				<option value='100'>100</option>
					 			 </select> 
					 		</div> 
					 	</div> `;
				
		$(`#${gridId}`).after(pagerArea);

		let pagingNav =	new wijmo.input.CollectionViewNavigator(`#${pagerId}`, {
	        byPage: true,
	        headerFormat: 'Page {currentPage:n0} of {pageCount:n0}'
	    });
		
		//페이지 사이즈 수정이벤트
		$(document).on("change",`#${pagerSizeId}`,(e)=>{
			let value = parseInt($(e.target).val());
			this._flexCv.pageSize= value;
		});

		//페이징 활성화 이벤트
		//class 안에서 이벤트 리스너를 사용할경우 class함수또는 변수에 접근을 할수가 없다.
		// 이벤트 리스너 함수에서의 this는 해당객체이기 때문에. 그래서 화살표 함수를 사용하면 화살표함수는 this가 없음.
		// 화살표 함수에서 this를 사용할경우 상위 스코프로 올라감=> class의 함수와 변수에 접근이 가능함.
		// 대신 화살표 함수를 사용하면 해당 객체의 this사용이 안되므로 e 이벤트 객체의 target으로 jquery객체를 만듬. 
		$(document).on("click",`#${gridId}Paging`,(e)=>{
			
			let obj = $(e.target);
			let pagerId = gridId+"Pager";

			if(obj.hasClass('btn-falcon-primary')){
				//페이징 비활성화
				obj.addClass('btn-falcon-default');
				obj.removeClass('btn-falcon-primary');
				$('#'+pagerId).parent().addClass('d-none'); 
				
				this._flexCv.pageSize = 0;
				pagingNav.cv = null;

				this.setHeight( $(`#${gridId}`).height()+34);	//페이징 사이즈34
				
				
			}else{
				//페이징 활성화
				obj.addClass('btn-falcon-primary');
				obj.removeClass('btn-falcon-default');
				$('#'+pagerId).parent().removeClass('d-none'); 
				
				this._flexCv.pageSize  = parseInt($("#"+pagerSizeId).val());
				pagingNav.cv = this._flexCv;

				this.setHeight( $(`#${gridId}`).height()-34);	//페이징 사이즈34
				
			}
			
		});
		if(isVisible){
			this._flexCv.pageSize  = parseInt($("#"+pagerSizeId).val());
			pagingNav.cv = this._flexCv;
			$('#'+pagerId).parent().removeClass('d-none'); 
		}
			
		
	}

	
	/**
	 * 자동행 추가 활성화
	 */
	enableAutoRows(){
		this._flexGrid.allowAddNew = true;
	}

	/**
	 * 자동행 추가 비활성화
	 */
	disableAutoRows(){
		this._flexGrid.allowAddNew = false;
	}

	/**
	 * readonly 인 컬럼에서 자동행추가 기능을 사용할경우 readonly된 컬럼에 내용을 넣을수 없다.
	 * 하지만 추가된 행에 값을 넣어야 되는 경우 사용한다.
	 * 파라미터로 받은 컬럼행이 추가된 행의 col이라면 readonly 상태를 해지 시킨다.
	 * 
	 * 조회된 데이터는 readonly처럼 수정이 불가능하고 하고 자동행추가 기능을 사용해서 데이터를 추가하고싶을경우 사용
	 * 
	 * @param {array} arrayCol readOnly시키고 추가입력하고 싶은 컬럼명
	 */
	disableReadOnlyForAutoRows(arrayCol){
		//넘어온 배열의 컬럼속성이 readonly로 되어있으면 풀어준다.
		arrayCol.forEach(col=>this._flexGrid.getColumn(col).isReadOnly = false);
		
		//수정시작, 붙여넣기 시작시 이벤트발생
		this._flexGrid.beginningEdit.addHandler((s,e)=>editReadOnly(s,e));
		this._flexGrid.pastingCell.addHandler((s,e)=>editReadOnly(s,e));
		
		const editReadOnly = (s,e)=>{
			
			//수정할 컬럼이 파라미터로 받은 배열(readonly할 필드)에 포함되는지확인
			let result = arrayCol.some((value)=>value==s.columns[e.col].binding);
			if(!result) return;	
			
			let row = s.rows[e.row];
			//let colBinding = s.columns[e.col].binding;

			//신규로 생성한 행이 다른행으로 옮겨갈때(ex 1행에서 2행으로 포커스 이동) 행내용이 확정되었다고 보고 itemsAdded로 추가된다.
			//하나의 컬럼에 내용을 작성후 tab으로 다음컬럼으로 이동할경우 itemsAdded에 추가되지 않아 기존조회된 행이라 판단하여 e.cancel = true 처리된다.
			//그래서 해당컬럼이 작성되기 전이기때문에 dataItem안에 해당 컬럼값이 없기때문에 컬럼값이 없다면 기존데이터가 아니라 판단해서 수정가능토록 한다.
			
			if(wijmo.isUndefined(row)) return;
			if(wijmo.isNullOrWhiteSpace(row.dataItem)) return;
			//if(wijmo.isUndefined(row.dataItem[colBinding])) return;	//컬럼값이 없을수도 있기때문에 주석처리

			//itemsAdded 에 데이터가 있다면 추가된 행이고 데이터가 없다면 기존조회된 데이터라 판단.
			let isNewRow = this._flexCv.itemsAdded.some((value)=>{
				return value==row.dataItem;
			});

			if(!isNewRow) e.cancel = true;			

			//currentAddItem(현재 추가중인 행) 이라면 수정가능하게
			if(this._flexCv.currentAddItem===row.dataItem){
				e.cancel = 	false;	
			}

		}

	}
	
	/**
	 * 컬럼 그룹판넬 활성화
	 */
	enableGroupPanel(){
		let gridId = this._flexGrid.hostElement.id;
		
		let pannelId = gridId+"GroupPanel";
		let pannelArea = `<div id='${pannelId}' class='mb-2' style='font-size: 0.81rem;'></div> `;
		
		$(`#${gridId}`).before(pannelArea);
		
		new wijmo.grid.grouppanel.GroupPanel('#'+pannelId, {
	        placeholder: '그룹을 만드려면 여기로 컬럼을 드레그 하세요.',
	        grid: this._flexGrid
	    });

		this.setHeight( $(`#${gridId}`).height()-58);	//판넬사이즈58 

	}
	
	/**
	 * 컬럼 전체행 선택
	 * 엑셀처럼 하나의 컬럼헤드 선택시 전체 선택
	 * 기본은 정렬로 되어있음.
	 */
	enableColumnSelectionMod(){
		this._flexGrid.allowSorting= wijmo.grid.AllowSorting.None;
    	this._flexGrid.allowDragging= false; 			//컬럼헤드를 잡고 드레그 하면 이동가능
    	this._flexGrid.selectionMode= "MultiRange";
	}
	
	/**
	 * 그리드 행고정
	 * 옵션판넬에서 클릭이 아닌 파라미터를 던져서 수동으로 적용가능함.
	 * @param {Number} rowIndex 행고정 row index
	 * @returns 
	 */
	enableFrozenRow(rowIndex){
		if(!wijmo.isNullOrWhiteSpace(rowIndex)){
			this._flexGrid.frozenRows = rowIndex+1;
			return;
		}
		
		//파라미터가 없을경우 선택된 셀적용
		this._flexGrid.frozenRows = this._flexGrid.selection.row+1;
	}
	
	/**
	 * 그리드 열고정
	 * 옵션판넬에서 클릭이 아닌 파라미터를 던저서 수동으로 적용가능함.
	 * @param {String} colName 열고정할 컬럼명
	 * @returns 
	 */
	enableFrozenCol(col){

		//컬럼명으로 파라미터가 들어올경우 해당 컬럼명의 index를 찾아내서 적용함.
		if(!wijmo.isNullOrWhiteSpace(col)){
			let index = this._flexGrid.columns.findIndex(c=>c.binding==col);
			this._flexGrid.frozenColumns = index+1;
			return;
		}
		//파라미터가 없을경우 선택된 셀적용
		this._flexGrid.frozenColumns = this._flexGrid.selection.col+1;
	}
	
	
	
	
    /**
     * 필터 컬럼 생성
     * @param {array} arrayCol : 필터설정할 배열 ex)["col1","col2"] 옵션사항으로 파라미터 넘기지 않으면 전체 적용됨.
     * 체크컬럼인 boolean 타입 컬럼은 제외
     */
	enableFilterColumns(arrayCol){
		
		if(wijmo.isEmpty(this.#gridFilter)){
			this.#gridFilter = new wijmo.grid.filter.FlexGridFilter(this._flexGrid);
		}

		this.#gridFilter.defaultFilterType = wijmo.grid.filter.FilterType.Both;
		
		//특정컬럼이 넘어왔을대
		if(!wijmo.isNullOrWhiteSpace(arrayCol)){
			this.#gridFilter.filterColumns = arrayCol;
		}else{
			
			// let arr = new Array();
			// this._flexGrid.columns.forEach((value,index,array)=>{
			// 	if(value.dataType!=wijmo.DataType.Boolean){
			// 		arr.push(value.binding);
			// 	}			
			// });
			
			//위코드를 아래코드로 간소화 가능함.
			let arr = this._flexGrid.columns.filter(f=>f.dataType!=wijmo.DataType.Boolean).map(value=>value.binding);
			this.#gridFilter.filterColumns = arr;

		}

	}

	/**
	 * 그리드 행이동 가능토록 함.
	 * 행이동 가능토록 하려면 컬럼정렬 불가능하게 해야함.
	 * manualColumnsSorting([],false); 함수랑 같이 쓰도록 함.
	 */
	enableMoveRow(){
		//그리드 순서변경 이벤트
        let dragIndex;
        this._flexGrid.allowDragging = wijmo.grid.AllowDragging.Both;
        this._flexGrid.draggingRow.addHandler((s,e)=>{
            dragIndex = e.row;
            s.collectionView.moveCurrentToPosition(dragIndex);	//선택된 행으로 선택유지
        });
		
        this._flexGrid.draggedRow.addHandler((s,e)=>{
            let dropIndex = e.row, arr = s.collectionView.sourceCollection;
            s.collectionView.deferUpdate(()=>{
                let item = arr[dragIndex];
                arr.splice(dragIndex,1);        //드레그된 아이템 배열삭제
                arr.splice(dropIndex,0,item);   //드레그된 아이템 배열추가
                s.collectionView.moveCurrentToPosition(dropIndex);	//이동된 행으로 선택유지
            });
        });

	}

	/**
     * 체크컬럼에서 선택된 리스트 배열을 반환함.
	 * 체크 컬럼의 타입은 반드시 boolean 이어야함.
     * @param {String} col :컬럼 binding 명
     * @returns array
     */
	getCheckList(col){
		
		//자동행추가 없애고 선택된 행의 데이터 반환
		//자동행추가 기능일경우 item.dataItem 값이 null임.
		// if(!wijmo.isNullOrWhiteSpace(item.dataItem)) 문도 적용안됨 item.dataItem 값이 Object형태이기때문에 null 비교가 안됨.
		this.disableAutoRows();
		let checkList = this._flexGrid.rows.filter(item=>item.dataItem[col]).map(item=>item.dataItem);
		
		return checkList;
		
	}

	/**
	 * 그리드 행카운트
	 */
	getRowCnt(){
		return this._flexCv.totalItemCount;
	}

	/**
	 * 그리드 내용 table로 렌더링
	 */
	renderTable(){
		let tbl = `<table class='table table-bordered'>`;
		//table header 부분
		if(this._flexGrid.headersVisibility & wijmo.grid.HeadersVisibility.Column){
			tbl += '<thead>';
			this._flexGrid.columnHeaders.rows.forEach((row,index)=>{
				tbl += this.#renderRow(this._flexGrid.columnHeaders,index);
			});
			tbl += '</thead>';
		}
		//table body 부분
		tbl += '<tbody>';
		this._flexGrid.rows.forEach((row,index)=>{
			tbl += this.#renderRow(this._flexGrid.cells,index);
		});
		tbl += '</tbody>';
		tbl += '</table>';

		return tbl;
	}
	
	#renderRow(panel,rIndex){
		let tr = '', row = panel.rows[rIndex];
		if(row.renderSize > 0){
			tr += '<tr>';
			panel.columns.forEach((col,cIndex)=>{
				if(col.renderSize > 0){
					let style = `width:${col.renderSize}px; text-align:${col.getAlignment()};padding-right:4px;`;	//style 지정
					let content = panel.getCellData(rIndex,cIndex,true);	//내용추출
					if(row.isContentHtml && col.isContentHtml){				//cell안에 innerHtml로 삽입된 내용은 텍스트로 변환하여 뽑아옴.
						content = wijmo.escapeHtml(content);
					}
					//행에 cell 추가
					if(panel.cellType == wijmo.grid.CellType.ColumnHeader){	//컬럼헤더인지 여부확인 헤더라면 th태그
						tr += `<th style='${style}'> ${content}</th>`;
					}else{	//일반셀이라면 td태그
						let raw = panel.getCellData(rIndex,cIndex,false);	//체크박스인지 확인
						if(raw===true) content = '&#9745;'
						else if(raw===false) content = '&#9744;';
						
						tr += `<td style = '${style}'>${content}</td>`;
					}
				}
			});
			tr += '</tr>';
		}
		return tr;
		
	}
	
	/**
     * 옵션박스 버튼 숨기기
     * @param {array} arryId  숨기고싶은 박스의 ID값 배열 ex)["id1","id2"]
     */
	invisibleOptionPanelButton(arrayId){
		arrayId.forEach(id=>{
			$("#"+id).addClass("d-none");
			$("#"+id).removeClass("d-lg-inline-block"); //이게 있어서 gridOption searchbox 안없어짐
		});
	}
	
	/**
	 * 그리드 전체 reanonly
	 */
	isReadOnly(){
		this._flexGrid.isReadOnly = true;
	}
	
	
	/**
	 * 그리드 새로고침
	 */
	refresh(){
		
		//confirm('그리드를 초기화 하시겠습니까?','그리드 내역이 초기화 됩니다.',consts.MSGBOX.QUESTION,()=>{

			//validation 체크로 붉은색으로 열려있는 셀을 모두 종료시키고 초기화해야함.
			this._flexGrid.validateEdits = false;
			this._flexGrid.finishEditing(false);
			//초기화
			this._flexCv.sourceCollection = [];
			//초기화 후 원상복구
			this._flexGrid.validateEdits = true;
			this._flexGrid.finishEditing(true);
		//});
		
	}
	
	/**
     * 컬럼명 정의
     * @param {array} columnsDefinition : 컬럼내용
     * ex) [{binding:'',header:'',width:100}]
     */
	setColumnsDefinition(columnsDefinition){
		this._flexGrid.initialize({
			columns:columnsDefinition
		});
		//컬럼 전체 필수입력 false로 만듬.
		//기본이 true 인데 true일경우 getError문 사용시 컬럼값이 공백일경우 오류가 발생함.
		//필수 입력값을 요구할경우 getError문에서 필수입력값 처리를 해야함.
		this._flexGrid.columns.forEach((value)=>{
			value.isRequired = false;
		});
		
		this.#enableHighlightCheckBoxRow();
	}

	/**
	 * 행 선택 체크박스를 체크할경우 행전체 색상표시
	 * setColumnsDefinition 함수로 컬럼이 정의 될때 자동으로 호출됨.
	 * @returns 
	 */
	#enableHighlightCheckBoxRow(){
		
		//컬럼명에 select 체크박스 컬럼이 있는경우만
		if(wijmo.isNullOrWhiteSpace(this._flexGrid.getColumn('select'))) return;

		//행 선택 체크박스(첫행의 행전체 선택박스 binding명은 'select' 여야함) 선택시 행 색상처리 => 함수로 빼야함.
		this._flexGrid.formatItem.addHandler((s,e)=>{
			if(e.panel.cellType===wijmo.grid.CellType.Cell){
				//wijmo.closestClass: 지정된 요소에서 가장 가까운 상위요소를 찾는함수 
				//컬럼들을 포함하는 row를 찾아서 selected-row 클래스를 추가함
				let rowElement = wijmo.closestClass(e.cell,'wj-row');

				//wijmo 그리드는 셀을 내용이 많을경우 재사용하는 구조이다. 스크롤바를 내릴경우 기존셀을 재사용함.
				// 때문에 formatItem을 사용할때 이미 추가된 class를 초기화 하는 구문이 필요함. => 그렇지 않을경우 스크롤할때 색상이 이상하게됨.

				//초기화 
				wijmo.removeClass(rowElement,'selected-row');
				//선택된 내역이라면 색상
				
				if(!wijmo.isNullOrWhiteSpace(s.rows[e.row].dataItem) && s.rows[e.row].dataItem.select){
					wijmo.addClass(rowElement,'selected-row');
				}
				
			}
		});
	}
	
	/**
     * 고정형 그리드 높이 설정
     * @param {number} value :높이값 (650px)
     */
	setHeight(value){
		let gridId = this._flexGrid.hostElement.id;
		$(`#${gridId}`).height(value);
	}

	/**
	 * 동적형 그리드 높이 설정
	 * 화면 비율에 따라 그리드 높이가 자동 조절됨.
	 * @param {number} value : 초기 높이값
	 */
	setDynamicHeight(value){
		let gridId = this._flexGrid.hostElement.id;
		this.setHeight(value); //초기 그리드height 지정

		$(window).on("resize",()=>{
			this.#resizeContents(gridId);
		});

		this.#resizeContents(gridId);

    }

	/**
	 * 그리드 자동조절 private 함수
	 * @param {String} gridId 그리드id값
	 */
	#resizeContents(gridId){
		this.setHeight($('#'+gridId).height() - (this.#fullWindowHeight-$(window).outerHeight()));	//초기그리드height - (기본화면사이즈 - 변경된 화면사이즈)
		this.#fullWindowHeight = $(window).height();	
	}
	
	/**
     * 그리드 header 높이 지정
     * @param {number} value : 높이사이즈
     */
	setHeaderRowSize(value){
		this._flexGrid.columnHeaders.rows.defaultSize = value;
	}
	
    
	/**
     * 엑셀 변환
     * @param {String} fileName 엑셀파일명
     */
	exportExcel(fileName){
		wijmo.grid.xlsx.FlexGridXlsxConverter.saveAsync(this._flexGrid,
			{
				includeColumnHeaders: true,
				includeStyles:false,  //그리드 스타일까지 가져감.
			},fileName
		);
	}

	/**
	 * 
	 * @param {String} fileName pdf파일명
	 * @param {Number} orientation 세로출력:0, 가로출력:1
	 */
	exportPdf(fileName,orientations){
		let orientation = 0;	//기본세로출력
		if(!wijmo.isEmpty(orientations)) orientation = orientations;

		wijmo.grid.pdf.FlexGridPdfConverter.export(this._flexGrid,fileName,
			{
				scaleMode: wijmo.grid.pdf.ScaleMode.PageWidth,
				exportMode: wijmo.grid.pdf.ExportMode.All,
				documentOptions:{
					pageSettings: {
						layout: orientation
					},
					compress: true,
        			footer: { declarative: { text: '\t&[Page] of &[Pages]' } }
        			//info: { author: 'Hy-Lok', title: 'Learn Wijmo' }
				},
				styles:{
					cellStyle: { backgroundColor: '#ffffff', borderColor: '#c6c6c6' ,font:{family:'nanum'}},
        			altCellStyle: { backgroundColor: '#f9f9f9' },
        			groupCellStyle: { backgroundColor: '#dddddd' },
        			headerCellStyle: { backgroundColor: '#eaeaea' },
					
				},
				embeddedFonts:[
					{
						source: '/font/NanumGothic/NanumGothic.ttf',
						name:'nanum',
						style:'normal',
						weight: 'nomal',
						sansSerif: true
					}
				]
			}
		);
	}

	/**
	 * 대문자로 변경
	 * @param {array} arrayCol 대문자로 변경할 컬럼배열
	 * * ex) ['bpc','jil']
	 */
	toUpperCase(arrayCol){

		const upperCase = (s,e,value)=>{
			if(e.panel==s.cells){
				//수정할 컬럼이 넘어온 배열컬럼에 존재하는지 여부
				if(arrayCol.includes(s.columns[e.col].binding)){	
					value = value.toUpperCase();
					s.cells.setCellData(e.row,e.col,value);    
					//s.collectionView.items[e.row][s.columns[e.col].binding] = value; //collectionView에 바로 적용해도됨.
					e.cancel = true;	//키보드에서 입력한 값 취소
				}
            }
		}

		//입력이벤트
		this._flexGrid.cellEditEnding.addHandler((s,e)=>{
			let value = wijmo.isNullOrWhiteSpace(s.activeEditor)? "":s.activeEditor.value;
            upperCase(s,e,value);
		});
		//붙여넣기 이벤트
		this._flexGrid.pastingCell.addHandler((s,e)=>upperCase(s,e,e.data));

	}

	/**
	 * 소문자로 변경
	 * @param {array} arrayCol 소문자로 변경할 컬럼배열 
	 * ex) ['bpc','jil']
	 */
	toLowerCase(arrayCol){

		const lowerCase = (s,e,value)=>{
			if(e.panel==s.cells){
				//수정할 컬럼이 넘어온 배열컬럼에 존재하는지 여부
				if(arrayCol.includes(s.columns[e.col].binding)){	
					value = value.toLowerCase();
					s.cells.setCellData(e.row,e.col,value);    
					//s.collectionView.items[e.row][s.columns[e.col].binding] = value; //collectionView에 바로 적용해도됨.
					e.cancel = true;	//키보드에서 입력한 값 취소
				}
            }
		}

		//입력이벤트
		this._flexGrid.cellEditEnding.addHandler((s,e)=>{
			let value = wijmo.isNullOrWhiteSpace(s.activeEditor)? "":s.activeEditor.value;
            lowerCase(s,e,value);
		});
		//붙여넣기 이벤트
		this._flexGrid.pastingCell.addHandler((s,e)=>lowerCase(s,e,e.data));

	}
	

	/**
	 * 그리드 클릭시 자동 edit모드(항상편집모드)
	 */
	startEditMode(){
		let index = this._flexGrid.selection.col, col = index > -1 ? this._flexGrid.columns[index] : null;
	    if (col && !col.isReadOnly && col.dataType != wijmo.DataType.Boolean) {
	        setTimeout(() => {
	            this._flexGrid.startEditing(false); // quick mode
			}, 50); // let the grid update first
	    }
	}
	
    /**
     * 그리드 list를 배열로 반환
	 * 그리드 데이터를 serverside로 json 형태로 일괄 전송시 배열변환이 필요함.
	 * collectionView의 itemsAdded,itemsEdited, itemsRemoved 객체는 순수 배열만 있는게 아닌 wijmo관련 객체도 함께 포함되어있다.
	 * 이를 순수데이터만 있는 배열형태로 변환작업
     * @param {array} itemList 
     * @returns 
     */
	gridItemListToArray(itemList){
		//return itemList.map((item)=>{return item;});
		return itemList.map(item=>item);
	}
	
	/**
	 * 그리드 검색박스
	 * @param {selector} id 검색박스 만들 div selector
	 */
	createSearchBox(id){
		new wijmo.grid.search.FlexGridSearch(id,{
            placeholder:'검색',
            grid: this._flexGrid
        });
	}
	/**
	 * 그리드 validation 체크
	 * 그리드 저장시에 validation 검증을 한다.
	 * 코드상에 반드시 컬렉션뷰의 getError 함수가 미리 구현되어 있어야한다.
	 */
	gridValidation(){
		let result = true;

		//그리드에 입력중인 내역이 있을경우(그리드가 edit창일경우)
		if(this._flexCv.isEditingItem){
            return false;
        }

		this._flexGrid.rows.forEach((row,index,array)=>{
			this._flexGrid.columns.forEach((col,index,array)=>{
				let error = this._flexCv.getError(row.dataItem,col.binding);
				if(!wijmo.isNullOrWhiteSpace(error)){
					result = false;
				}
			});
		});
		
		return result;
	}

	/**
	 * 그룹화 소계항목을 상위가 아닌 아래쪽에 표시
	 * aggregate 속성이 들어가 있는 필드는 소계합산됨.
	 * 
	 * @param {array} arrayCol 그룹화시킬 필드배열 [col1,col2]
	 */
	gridGroupBottom(arrayCol){
		
		arrayCol.forEach((col)=>{
			this._flexCv.groupDescriptions.push(new wijmo.collections.PropertyGroupDescription(col));
		});
        
        //그리드 로딩하면서 그룹화 시킨 행을 하단으로 이동시킴.
        this._flexGrid.loadedRows.addHandler((s,e)=>{
			if(s.rows.length<1) return;
            if(s.collectionView.groupDescriptions.length){
                let sNo = 0;    //그룹행 시작점
                let newRow;     //그룹행을 복사할 신규행
                s.rows.forEach((row,index,array)=>{
                    
                    if(row instanceof wijmo.grid.GroupRow){
                        
                        if(index < 1){  //첫번째 그룹행
                            sNo = index;
                            newRow = row;
                        } 
                        else{   //두번째 이상 그룹행
                            s.rows.splice(index,0,newRow);  //복사된 group 추가
                            s.rows.splice(sNo,1);   //group 삭제
                            
                            sNo =index;
                            newRow = row;
                        }
                    }
                });
                
                s.rows.splice(s.rows.length,0,newRow);  //마지막 복사된 group 추가
                s.rows.splice(sNo,1);   //group 삭제
                
                s.refresh();
            }
        });
        //그룹을 이동시킨거라 0번컬럼을 커스터마이징.
        this._flexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel == s.cells && s.rows[e.row] instanceof wijmo.grid.GroupRow){
                s.rows[e.row].cssClass = 'text-center';
                
                if(e.col==0){
                    e.cell.innerHTML = s.rows[e.row].dataItem.name+" 소계";
                }
            }
        });
	}

	/**
	 * 컬럼 수동 정렬 
	 * header클릭시 정렬을 없애고 수동으로 컬럼들을 정렬시킬경우.
	 * @param {array} arrayCol 
	 * @param {boolean} ascending true: 오름차순, false: 내림차순
	 */
	manualColumnsSorting(arrayCol,ascending){
		//컬럼header 클릭시 정렬 금지
		this._flexGrid.allowSorting = wijmo.grid.AllowSorting.None;
		//정렬컬럼 입력
		arrayCol.forEach((col)=>{
			this._flexCv.sortDescriptions.push(new wijmo.collections.SortDescription(col,ascending));
		});
	}

	/**
	 * 그리드내에서 파라미터의 컬럼에서 파라미터로 넘어온 value값과 중복 값이 존재하는지 여부
	 * getError 문에서 주로 사용함.
	 * @param {Object} row 데이터 
	 * @param {array} value 컬럼배열
	 */
	isSameColumnValue(rowItem, arrayCol){
		let sameCnt = 0;
		this._flexCv.items.forEach(item=>{
			//동일항목(입력하는행은 제외) 시키니 같은 항목을 가진 다른행만 붉은색 표시가 나서
			//중복되는 모든 행에 붉은색표시를 위해 모두 비교함.
			//if(item!=rowItem){
				//중복비교해야할 컬럼이 입력하는행(rowItem)과 조회된 항목과 모두 같은지 비교
				let allMatch = arrayCol.every(col=>item[col]===rowItem[col]);
				if(allMatch) sameCnt++;
			//}
		});
		return sameCnt >1;
	}

	/**
	 * 그리드 내 포커스 이동시
	 * @param {number} row 이동할 row
	 * @param {String} col 이동할 컬럼명
	 */
	moveFocus(row,col){
		this._flexGrid.select(row,col);
		this._flexGrid.focus();
	}

	/**
	 * New Row 추가시 기본값 설정
	 * @param {function} getDefaultItem : 반환될 기본값 정의 함수
	 * const getDefaultItem = () => {
            return {
                acuYymm: searchUseDte.text,
                acuPayym: dateUtils.addMonth(searchUseDte.text, 1, 'YYYY-MM'),
            };
        }
	 */
	setNewRowDefault(getDefaultItem){
		this._flexCv.newItemCreator = (t)=>{
			return getDefaultItem();
	  	}
    }

	/**
	 * 병합된 셀 가운데 정렬
	 * @param {*} arrayCol 
	 */
	mergeCellAlignCenter(arrayCol){
		this._flexGrid.formatItem.addHandler((s,e)=>{
			if(e.panel.cellType == wijmo.grid.CellType.Cell){
				if(arrayCol.includes(s.columns[e.col].binding)){
					wijmo.setCss(e.cell,{
						display:'flex',
						justifyContent:'center',
						alignItems:'center'
					});
				}
			}		
		});
	}
}

/**
 * 컬럼에 allowMerging =true로 설정할경우 컬럼 상,하만 병합된다. 
 * 행에 allowMerging=true로 설정할 경우 좌,우가 병합된다.
 * 두개 옵션이 같이 적용이 안됨.
 * 
 * 같은 값일경우 모든 셀이 병합이 자동으로 이루어짐.
 */
class CustomMergeManager extends wijmo.grid.MergeManager{
	getMergedRange(panel,r,c,clip = true){
		let rng = new wijmo.grid.CellRange(r,c);

		//컬럼 좌우 같은지 비교
		for(let i = rng.col;i<panel.columns.length-1;i++){
			if(panel.getCellData(rng.row,i,true)!=panel.getCellData(rng.row,i+1,true))
				break;
			rng.col2 = i+1;
		}

		for(let i = rng.col;i>0;i--){
			if(panel.getCellData(rng.row,i,true)!=panel.getCellData(rng.row,i-1,true))
				break;
			rng.col = i-1;
		}
		//컬럼 상하 같은지 비교
		for(let i = rng.row;i<panel.rows.length-1;i++){
			if(panel.getCellData(i,rng.col,true) != panel.getCellData(i+1,rng.col,true))
				break;
			rng.row2 = i+1;
		}
		for(let i = rng.row;i>0;i--){
			if(panel.getCellData(i,rng.col,true) != panel.getCellData(i-1,rng.col,true))
				break;
			rng.row = i-1;
		}

		return rng;
		
	}
	
}


