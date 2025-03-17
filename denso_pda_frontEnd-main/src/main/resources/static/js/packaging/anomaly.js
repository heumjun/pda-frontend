
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as consts from "../common/constants.js";
import { pushMsg, alertWarning, confirm } from "../common/msgBox.js";

const anomaly = function(){

	const getComboLineList = () => {
		let params = {
	        uri : "lotFault/lotFault/getComboLineList"
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["comboLineList"];
	};
	const getComboEquipCodeList = () => {
		let params = {
	        uri : "lotFault/lotFault/getComboEquipCodeList"
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["comboEquipCodeList"];
	};
	
    let grid  = new GridFactory('#grid');
	let st09Line = input.comboBox('#st09Line', getComboLineList(), 'lineCode','lineNm');
	let st09EquipCode = input.comboBox('#st09EquipCode', getComboEquipCodeList(), 'cm07Code','cm07Name');
    /**
     * 그리드 초기화
     */
    const gridInit = () => {

        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
			{binding:'delete'	,header: '삭제'	,width: 80
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '<b style="color:red;">삭제</b>'
					,click: (e, ctx) => {
						let view = grid._flexCv;
						let rowIndex = ctx.row.index; // rowIndex 가져오기
					    if (rowIndex >= 0 && rowIndex < view.items.length) {
					      	  view.removeAt(rowIndex);
					    }
					}
				})
			},
			{binding:'st09Code'		,header:'품목명'		,width:150	,dataType:'String'	,align:'left'	,visible:false},
            {binding:'st09Name'		,header:'품목명'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'st09Gbn'		,header:'구분'		,width:90	,align:'center'		,dataType:'String'},
            {binding:'st09Qrcode'	,header:'QR코드'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true},
			{binding:'st09Qty'		,header:'수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true	,isReadOnly: true},
			{binding:'st09Lot'		,header:'LOT번호'		,width:180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st09LotSeq'	,header:'LOT SEQ'	,width:90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st09Dat'		,header:'날짜'		,width:90	,align:'center'		,dataType:'String'	,visible:false},
        ];
		
        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(550);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');

		let st09Gbn = getCommonCodeList('AN01');
		grid._flexGrid.getColumn('st09Gbn').dataMap = new wijmo.grid.DataMap(st09Gbn, 'cm05Value', 'cm05Name');
		
		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

			let sameCode = grid._flexCv.sourceCollection.filter((c) =>
							( c.st02Company == item.st02Company && c.st02Factory == item.st02Factory && c.st02Code == item.st02Code && c.st02Lot == item.st02Lot && c.st02Qrcode == item.st03Qrcode));

            switch (prop) {
                case 'st03Qr':
                    if(wijmo.isNullOrWhiteSpace(item.st03Qr)) return '[QR코드]는 필수 입력 항목입니다.';
					if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'st02Ipqty':
                    if(item.st02Ipqty <= 0) return '[박스수량]은 0보다 커야합니다.';
                    break;
                default:
                    return null;
            }
        }

    }
	
	/**
	 * 공통코드
	 */
	const getCommonCodeList = (commonCode) => {
	    let params = {
	        uri :"criteria/commonCode/"+commonCode+"/detail"
	    };
	   
	   let list = ajax.getAjaxSync(params);
	   
	   return list["commonCodeDetailList"];

	}

	// 바코드 스캔시 품목 검사
	const barcodeSearch = async(barcode) => {

		grid.disableAutoRows();
		
		//① ASSY품번 10자리 + 1자리(층별용) : 11자리
		//② QR CODE 작성일시(YYMMDDHHMM) : 10자리
		//③ lot내 순번(3자리)/LOT 수(3자리):6자리
		//④ 언로더 Pitch (1차면:2칸, 2차면:4칸)
		//⑤ 기판폭 : 3자리
		//⑥ SEQ No : 4자리
		//var barcode = "411120516102503161000 020168 000000004158008";
		
		let temp = grid._flexCv.sourceCollection.filter((c) => ( c.st09Qrcode === barcode ));
		if(temp.length != 0) {
			alertWarning('중복 항목', `중복된 항목입니다.`);
			return;
		}

		let params = {
	        uri: `anomaly/anomaly`,
			st09Qrcode : barcode
	    }
	    params = {...params,...ajax.getParams('searchForm')}

	    try {
	        let {anomalyInfo} = await ajax.getAjax(params, true);

			if ( anomalyInfo != null ) {
				 
				let addRow = grid._flexCv.addNew();
				
				addRow.st09Dat = barcode.substring(11, 21);
				addRow.st09Code = anomalyInfo.st09Code;
				addRow.st09Name = anomalyInfo.st09Name;
				addRow.st09LotSeq = anomalyInfo.st09LotSeq;
				addRow.st09Lot = anomalyInfo.st09Lot;
				addRow.st09Gbn = '0001';
				addRow.st09Qty = 1;
				addRow.st09Qrcode = barcode;
				
				grid._flexCv.commitNew();
			} else {
				alertWarning('등록불가','이상처리 품목 대상이 아닙니다.');	
			}

	    } catch(error) {
	        console.debug(error);
	        return;
	    }

    }

	const goBack = () => {
		let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'index' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'index' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'작업 - QR 스캔' }));
		form.appendTo('body');
		form.submit();
	}

	const saveAnomaly = () => {

		grid.disableAutoRows();

		/*if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }*/

		let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		if(insertList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

		confirm("이상처리을 등록하시겠습니까?", "이상처리 이력이 등록됩니다.", consts.MSGBOX.QUESTION, () => {

			let params = {
                uri: `anomaly/anomaly`,
                insertList: insertList,
				st09Line: st09Line.selectedValue,
				st09EquipCode: st09EquipCode.selectedValue
            };

			params = {...params,...ajax.getParams('#submitForm')};

        	ajax.postAjax(params, true).then(async (data)=>{
				$("#btnSave").hide();
	            pushMsg('이상처리가 등록되었습니다.');
            }).catch((e)=>{
                //console.debug(e);
            });
		});
	}

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = () => {

        gridInit();
		//barcodeSearch();

		$('#btnSave').on('click', saveAnomaly);
		$('#btnBack').on('click', goBack);
    }

	// 스캐너 값 얻기
	$(document).scannerDetection({
		/*timeBeforeScanTest: 50, // wait for the next character for upto 200ms
		startChar: [16, 45, 189], // Prefix character for the cabled scanner (OPL6845R)
		changeChar: [189], // Prefix character for the cabled scanner (OPL6845R)*/
		onComplete: function(barcode, qty) {
			
			barcode = barcode.toUpperCase();
			let matchBar = true;
			//barcode = barcode.toUpperCase();
			
			// 중복체크 기능 필요
			grid._flexGrid.rows.some((row, index, array) => {
				if (!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)) {
					if(row.dataItem.st09Qrcode == barcode) {
						alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
						matchBar = false;
					}
				}
			});
			
			if ( matchBar ) {
				barcodeSearch(barcode);	
			}

			/*if(barcode.substring(0, 3) == "3N1"){

				var beforeBar = barcode;
	            // 트레스 라벨 앞부분 짜르기
	            barcode = barcode.replaceAll("3N1", "");
	            // 트레스 라벨을 공백으로 자름
	            barcode = barcode.split(" ");
	            // 품번 가져오기
	            var code = barcode[0];

				grid._flexGrid.rows.some((row,index,array) => {
					if (!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)) {
						// 로우에 있는 품목코드와 바코드의 품목코드, 로우에 있는 품목구분과 바코드의 품목구분 비교
						// QR코드가 비어있느 항목에 값이 들어가도록 설정
						if(row.dataItem.cm08Code == code) {
							if(wijmo.isNullOrWhiteSpace(row.dataItem.st03Qr) || wijmo.isUndefined(row.dataItem.st03Qr)){
								matchBar = true;
								//grid._flexGrid.setCellData(row.index, 'select', true);

								// 중복체크 기능 필요
								for(var i=0; i < grid._flexGrid.rows.length; i++){
									if(!wijmo.isUndefined(grid._flexGrid.getCellData(i, 'st03Qr'))){
										if(beforeBar == grid._flexGrid.getCellData(i, 'st03Qr')){
											grid._flexGrid.setCellData(index, 'st03Qr', "");
											alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
											return ;
										}
									}
								}

								var lot = barcode[3];
								var lotSeq = barcode[2];

								grid._flexGrid.setCellData(index, 'st03Lot', lot);
								grid._flexGrid.setCellData(index, 'st03LotSeq', lotSeq);
								grid._flexGrid.setCellData(index, 'st03Qr', beforeBar);
								// 창고, 구역 가져와서 넣어주고 return true 해야한다.
								getStokDistInfo(index, code, lot, lotSeq);
								return true;
							}
						}
					}
				});

				// 바코드의 lot와 row의 lot가 매치가 되지 않았을 경우
				if(matchBar == false) {
					alertWarning("작업불가", "리딩한 바코드와 일치하는 LOT번호가 존재하지 않습니다.")
					return ;
				}
			// SCM 라벨을 조회 시 17자리
			} else {
				// SCM QR코드 값으로 입고테이블을 검색해서 입고 데이터를 가져와서 뿌려줘야함.
				let params ={
					uri :"warehousing/warehousing/stock/getInputInfo",
					barcode : barcode
				};

				ajax.getAjax(params, false).then(data => {

					let inputInfo = data["inputInfo"];

					if(inputInfo != null) {
						grid._flexGrid.rows.some((row,index,array)=>{
							if(!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)){
								if(row.dataItem.cm08Code == inputInfo.st02Code && barcode == inputInfo.st02Qrcode){
									if(wijmo.isNullOrWhiteSpace(row.dataItem.st03Qr) || wijmo.isUndefined(row.dataItem.st03Qr)){
										matchBar = true;
										for(var i=0; i<grid._flexGrid.rows.length; i++){
											if(!wijmo.isUndefined(grid._flexGrid.getCellData(i,'st03Qr'))){
												if(barcode == grid._flexGrid.getCellData(i,'st03Qr')){
													grid._flexGrid.setCellData(index, 'st03Qr', '');
													alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
													return;
												}
											}
										}

										grid._flexGrid.setCellData(index, 'st03Lot', inputInfo.st02Lot);
										grid._flexGrid.setCellData(index, 'st03LotSeq', inputInfo.st02LotSeq);
										grid._flexGrid.setCellData(index, 'st03Qr', inputInfo.st02Qrcode);
										grid._flexGrid.setCellData(index, 'st03Stok', inputInfo.st02Stok);
										grid._flexGrid.setCellData(index, 'st03Dist', inputInfo.st02Dist);

										return true;
									}
								}
							}
						})

						// 바코드의 lot와 row의 lot가 매치가 되지 않았을 경우
					  	if(matchBar == false){
							 alertWarning("작업불가", "리딩한 바코드와 일치하는 LOT번호가 존재하지 않습니다.");
						 	return ;
					  	}

					// 품번과 일치하지 않는 경우
					} else {
						alertWarning('작업 불가', '리딩한 QR코드의 LOT가 존재하지않거나\n 재고가 존재하지 않습니다.');
						return ;
					}


				});
			}*/
		}
	});

	const getStokDistInfo = async (index, code, lot, lotSeq)=>{
		let params = {
			uri : 'output/getStokDist',
			st03Code : code,
			st03Lot : lot,
			st03LotSeq : lotSeq
		};



		await ajax.getAjax(params, true).then(async (data) => {
			let stokDistInfo = data["stokDistInfo"];

			if(stokDistInfo != null) {
				grid._flexGrid.setCellData(index, 'st03Stok', stokDistInfo.st01Stok);
				grid._flexGrid.setCellData(index, 'st03Dist', stokDistInfo.st01District);
			}
		});
	}

    return{
        init:()=>{
            handleEvent();
        }
    }
}();


$(()=>{
    anomaly.init();

});
