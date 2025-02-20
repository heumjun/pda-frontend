import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const board = function(){

    let grid = new GridFactory('#grid');
    let searchStartdat = input.date('#searchStartdat');
    let searchEnddat = input.date('#searchEnddat');
    //let arrayStatus = [{'key':'N','name':'대기중'},{'key':'R','name':'진행중'},{'key':'Y','name':'완료'}];
    let boaStatus = input.comboBox('#boaStatus',[],'codCode','codName');
    let fileUpload = $('#attach-file').get(0).dropzone;
    let userInfo={};
    
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
        // let dataMapStatus =  new wijmo.grid.DataMap([{key:'N',name:'대기'},{key:'R',name:'진행'},{key:'Y',name:'완료'}], 'key', 'name');
        let columnsDefinition = [
            
            {binding:'mobile',visible:false,width:'*'},
            {binding:'boaIdx',header:'글번호',width:70,dataType:'Number', align:'center',format:'g0'},
            {binding:'boaTitle',header:'제목',width:400,dataType:'String',align:'center',isReadOnly:true,
                cellTemplate: wijmo.grid.cellmaker.CellMaker.makeLink({
                    click: (e,ctx)=> boardView(ctx.item.boaIdx)
                })
            },
            {binding:'boaDate',header:'등록일자',width:110,dataType:'Date',align:'center'},
            {binding:'name',header:'작성자',width:110,dataType:'String',align:'center'},
            {binding:'traName',header:'담당트레이너',width:110,dataType:'String',align:'center'},
            {binding:'boaStatus',header:'상태',width:70,dataType:'String',align:'center',//dataMap:dataMapStatus,
                cellTemplate: (ctx)=>{
                    let color = "secondary";
                    if(ctx.value=='R') color = "info";
                    if(ctx.value=='Y') color = "success";
                    return `<span class="badge rounded-pill bg-${color}">${ctx.text}</span>`
                }
            },
            {binding:'replyCnt',header:'댓글수',width:70,dataType:'Number',align:'center'},
            
        ];

        grid.setColumnsDefinition(columnsDefinition);
        grid.optionPanel('#grid-option');
        grid.setDynamicHeight(660);
        grid.isReadOnly();
        
        //모바일 화면에서 그리드 변경이벤트
        grid._flexGrid.formatItem.addHandler((s,e)=>{
            
            if(e.panel == s.cells && s.columns[e.col].binding == 'mobile'){

                let value = dataMapStatus.getDisplayValue(s.rows[e.row].dataItem.boaStatus);
                let color = "secondary";
                if(s.rows[e.row].dataItem.boaStatus=='R') color = 'info';
                if(s.rows[e.row].dataItem.boaStatus=='Y') color = 'success';
                let status = `<span class="ms-2 badge rounded-pill bg-${color}">${value}</span>`

                let html = wijmo.format(`<h6 class="mb-1 fw-semi-bold text-700 cursor-pointer" data-idx={boaIdx}>
                                            {boaTitle} ${status}
                                        </h6>
                                        <p class="fs--2 text-600 mb-0">{boaDate:D}</p>
                                        `,s.rows[e.row].dataItem);

                                        
                e.cell.innerHTML = html;
            }
        });
        let defaultRowHeight = grid._flexGrid.rows.defaultSize;

        grid._flexGrid.addEventListener(window,'resize',()=>{
            let narrow = grid._flexGrid.hostElement.clientWidth < 600;
            
            grid._flexGrid.columns.forEach((col)=>{
                col.visible = (col.binding =='mobile') ? narrow:!narrow;
            });

            grid._flexGrid.rows.defaultSize = defaultRowHeight * (narrow ? 2 : 1);
            grid._flexGrid.headersVisibility = narrow ? wijmo.grid.HeadersVisibility.Row : wijmo.grid.HeadersVisibility.All;

        });

        window.dispatchEvent(new Event('resize'));
        
    }

    /**
     * 내용 보기
     */
    const boardView = async (idx)=>{
        
        $('#attath-img').html("");
        $('#attachFile-viewlist').html("");
        $('#attachFile-viewarea').addClass('d-none');
        $('#comment-area').html('');


        let userInfo = $('#data-params').data('params').userInfo;

        let params = {
            uri: `boards/${idx}`
        };
        if(userInfo.role=='USER_ROLE') params['cusNo'] = userInfo.no;

        try {
            let {boardInfo,commentList} = await ajax.getAjax(params,false);

            $('#boardTitle').text(boardInfo.boaTitle);
            $('#boardDate').text(dateUtils.formatDate(boardInfo.boaDate,'YYYY-MM-DD HH:mm'));
            $('#boardCont').html(boardInfo.boaCont);
            $('#boaIdx').val(boardInfo.boaIdx);

            //콤보박스의 selectedIndexChanged 이벤트가 걸려있는데 초기값 셋팅시에도 이벤트 호출이됨.
            //이를 막고자 update시작 종료 이벤트를 발생시키고 selectedIndexChanged이벤트에서 isUpdating 함수로 확인한다.
            //console.debug(boardInfo);
            boaStatus.beginUpdate();
            boaStatus.selectedValue = boardInfo.boaStatus;
            boaStatus.endUpdate();

            $('#preView').data('no',boardInfo.prevIdx) ;
            $('#nextView').data('no',boardInfo.nextIdx) ;

            //글쓴 사람이 본인이라면 수정,삭제 버튼 보이기
            if(userInfo.no==boardInfo.boaCusno){
                $('#btn-edit').removeClass('d-none');
                $('#btn-del').removeClass('d-none');
            }
            
            if(!wijmo.isNullOrWhiteSpace(boardInfo.boaFile)){
                
                //첨부파일 확장자추출
                let ext = boardInfo.boaPfile.split('.').pop().toLowerCase();
                if(['jpg','jpeg','png','gif','bmp'].includes(ext)){
                    let imageUrl = `rest-api/image-view/board/${boardInfo.boaPfile}`;
                    $('#attath-img').html(`<img src="${imageUrl}" class="img-fluid" >`);
                }

                $('#attachFile-viewarea').removeClass('d-none');
                let sss = `<div class="border p-2 rounded-3 d-flex bg-white dark__bg-1000 fs--1 mb-2">
                                <span class="fs-1 fas fa-file-archive"></span><span class="ms-2 me-3">${boardInfo.boaFile}</span>
                                <a class="text-300 ms-auto" href="#!" data-bs-toggle="tooltip" data-bs-placement="right" title="다운로드" data-file-download='{"filePname":"${boardInfo.boaPfile}","fileName":"${boardInfo.boaFile}"}' ><span class="fas fa-arrow-down"></span></a>
                            </div>`;

                $('#attachFile-viewlist').append(sss);
                tooltipArea('#attachFile-viewlist');
            }
            
            
            //댓글리스트
            commentList.forEach((item)=>{
                let sss = `
                    <div class="d-flex p-3">
                        <div class="avatar avatar-l me-2">
                            <img class="rounded-circle" src="../assets/img/team/avatar.png" alt="">
                        </div>
                        <div class="flex-1">
                            <div class="w-xxl-75">
                            <div class="hover-actions-trigger d-flex align-items-center">
                                <div class="chat-message bg-200 p-2 rounded-2">${item.boaCont}</div>`;
                if(userInfo.no==item.boaCusno || userInfo.role=='ADMIN_ROLE'){                            
                    //댓글수정 기능
                    // <li class="list-inline-item">
                    //                     <a data-comment-edit=${item.boaIdx} class="chat-option" href="#!" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Edit" data-bs-original-title="Edit">
                    //                     <span class="fas fa-edit"></span>
                    //                     </a>
                    //                 </li>
                    sss +=`     <ul class="hover-actions position-relative list-inline mb-0 text-400 ms-2">
                                    
                                    <li class="list-inline-item" >
                                        <a data-comment-remove=${item.boaIdx} class="chat-option" href="#!" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Remove" data-bs-original-title="Remove">
                                        <span class="fas fa-trash-alt"></span>
                                        </a>
                                    </li>
                                </ul>`;
                }
                    sss+=`  </div>
                            <div class="text-400 fs--2">
                                <span class="me-3">${item.gbn=='trainer'?'트레이너:':'고객:'} ${item.name}</span>
                                <span>${dateUtils.formatDate(item.boaDate,'YY-MM-DD hh:mm a')}</span>
                            </div>
                            </div>
                        </div>
                    </div>
                `
                $('#comment-area').append(sss);
            });

        } catch (error) {
            console.debug(error);
        }
        
        $('#modal-view').modal('show');

    }
    
    /**
     * 상담내역 등록 form 초기화
     */
    const boardInit = ()=>{
        $('#attachFile-area').addClass('d-none');
        $('#attachFile-list').html("");
        $('#boaTitle').val("");
        tinymce.get("boaCont").setContent("");
        $('#boaIdx').val('');
        fileUpload.removeAllFiles(true);    //첨부파일 dropzone 초기화

    }

    /**
     * 상담 수정
     */
    const editBoard = async (idx)=>{
        
        boardInit();
        $('#boaIdx').val(idx);

        let params = {
            uri: `boards/${idx}`
        };
        try {
            let {boardInfo} = await ajax.getAjax(params,true);
            $('#boaTitle').val(boardInfo.boaTitle);
            tinymce.get("boaCont").setContent(boardInfo.boaCont);

            if(!wijmo.isNullOrWhiteSpace(boardInfo.boaFile)){
                $('#attachFile-area').removeClass('d-none');
                let sss = `<div class="border p-2 rounded-3 d-flex bg-white dark__bg-1000 fs--1 mb-2">
                                <span class="fs-1 fas fa-file-archive"></span><span class="ms-2 me-3">${boardInfo.boaFile}</span>
                                <a class="text-300 ms-auto" href="#!" data-bs-toggle="tooltip" data-bs-placement="right" title="다운로드" data-file-download='{"filePname":"${boardInfo.boaPfile}","fileName":"${boardInfo.boaFile}"}' ><span class="fas fa-arrow-down"></span></a>
                                <a class="text-300 ms-2" href="#!" data-bs-toggle="tooltip" data-bs-placement="right" title="삭제" data-file-delete=${idx}><span class="fas fa-trash-alt"></span></a>
                            </div>`;

                $('#attachFile-list').append(sss);
                tooltipArea('#attachFile-list');
            }

        } catch (error) {
            
        }
        $('#modal-view').modal('hide');
        $('#modal-write').modal('show');
    }

    /**
     * 조회 함수
     */
    const search = async ()=>{
        
        let params = {
            uri: `boards`
        }

        if(userInfo.role=='USER_ROLE') params['cusNo'] = userInfo.no;
        // console.debug(params);
        params = {...params,...ajax.getParams('#searchForm')};

        await ajax.getAjax(params,true).then(data=>{
            grid._flexCv.sourceCollection =  data['boardList'];
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 저장
     * @returns 
     */
    const saveOfBoard = ()=>{
        
        if(wijmo.isNullOrWhiteSpace($('#boaTitle').val())){
            alertWarning('저장불가','제목을 입력해주세요.');
            return;
        }
        let boaCont = tinymce.get("boaCont").getContent();

        if(wijmo.isNullOrWhiteSpace(wijmo.escapeHtml(boaCont))){
            alertWarning('저장불가','내용을 입력해주세요.');
            return;
        }


        let files = fileUpload.getAcceptedFiles();
        
        if(fileUpload.getRejectedFiles().length>0){
            alertWarning('저장불가','[첨부파일] 오류내용을 확인하세요.');
            return;
        }
        
        // console.debug($('#boaIdx').val());
        
        confirm('등록 하시겠습니까?','상담 내역이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `boards`,
                boaIdx: $('#boaIdx').val(),
                boaTitle: $('#boaTitle').val(),
                boaCont: boaCont,
            };

            
            ajax.fileUploadAjax(params,files,true).then(async date=>{
                $('#modal-write').modal('hide');
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
    const deleteOfBoard = ()=>{
        
        
        if(wijmo.isNullOrWhiteSpace($('#boaIdx').val())){
            alertWarning('삭제할 수 없습니다.','글번호가 없습니다.');
            return;
        }

        let idx = $('#boaIdx').val();

        confirm('삭제 하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `boards/${idx}`,
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                $('#modal-view').modal('hide');
                await search();
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
        

    }

    /**
     * 첨부파일 다운로드
     * @param {} e 
     */
    const fileDown = (e)=>{
        
        let data = $(e.target).data('file-download');
            
        let params = {
            fileName: data.fileName,   //파일이름
            filePname: "board/"+data.filePname
        };
        ajax.fileDownloadAjax(params);
    }
    
    /**
     * 첨부파일 삭제제
     * @param {} e 
     */
    const deleteOfFile = (e)=>{
        let idx = $(e.target).data('file-delete');

        confirm('삭제 하시겠습니까?','선택된 파일이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `boards/files/${idx}`,
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                editBoard(idx);
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });
    }

    /**
     * 댓글저장
     */
    const saveOfComment = ()=>{
        let idx = $('#boaIdx').val();
        let comment = $('#comment').val();

        if(wijmo.isNullOrWhiteSpace(comment)){
            alertWarning('저장불가','댓글을 입력해주세요.');
            return;
        }
        // console.debug(comment);

        confirm('댓글을 등록 하시겠습니까?','댓글이 저장됩니다.',consts.MSGBOX.QUESTION,()=>{
            let params = {
                uri: `boards/${idx}/comments`,
                boaCont: comment,
            };
            ajax.postAjax(params,true).then(async ()=>{
                $('#comment').val('');
                boardView(idx);
                pushMsg('저장 되었습니다.');
            }).catch((e)=>{});
        });

        
    }
    /**
     * 댓글 삭제
     * @param {event} e 
     * @returns 
     */
    const removeOfComment = (e)=>{
        
        let idx = $(e.target).data('comment-remove');
        
        if(wijmo.isNullOrWhiteSpace(idx)){
            alertWarning('삭제할 수 없습니다.','글번호가 없습니다.');
            return;
        }

        confirm('댓글을 삭제 하시겠습니까?','선택된 내역이 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
            
            let params = {
                uri: `boards/comment/${idx}`,
            }
            ajax.deleteAjax(params,true).then(async ()=>{
                boardView($('#boaIdx').val());
                pushMsg('삭제 되었습니다.');
            }).catch((e)=>{});
        });




    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = async ()=>{

        userInfo = $('#data-params').data('params').userInfo;
        //권한에 따른 버튼 보이기/숨기기(고객에만 보이기)
        // userInfo.role=='USER_ROLE' ? $('#btn-add').removeClass('d-none') : $('#btn-add').addClass('d-none');
        if(userInfo.role=='ADMIN_ROLE'){
            $('.admin-role').removeClass('d-none');
            $('.user-role').addClass('d-none');
        }

        gridInit();

        
        
        $('#btn-search').on('click',search);
        $('.btn-add').on('click',()=>{
            $('#modal-view').modal("hide");
            $('#modal-write').modal('show');
            $('#boaIdx').val('');
        });
        $('#btn-save').on('click',saveOfBoard);
        $('#btn-edit').on('click',()=>{
            let idx = $('#boaIdx').val();
            if(wijmo.isNullOrWhiteSpace(idx)){
                alertWarning('수정이 불가합니다.','글번호가 없습니다.');
                return;
            }
            editBoard(idx);
        });
        
        $('#btn-del').on('click',deleteOfBoard);
        //상담 등록 모달이 실행될때 타이틀에 포커스 이동.
        $("#modal-write").on('shown.bs.modal', function () {		
            $('#boaTitle').trigger('focus');
        });

        //상담등록 모달이 닫힐때 초기화
        $('#modal-write').on('hidden.bs.modal',()=>{
            boardInit();
        });

        $('#preView').on('click',function(){
            let idx = $(this).data('no');
            wijmo.isNullOrWhiteSpace(idx) ? alertInfo('이전글이 없습니다.') : boardView(idx);
        });

        $('#nextView').on('click',function(){
            let idx = $(this).data('no');
            wijmo.isNullOrWhiteSpace(idx) ? alertInfo('다음글이 없습니다.') : boardView(idx);
        });

        $('#btn-comment').on('click',saveOfComment)

        //모바일 환경으로 그리드가 변경되었을경우 제목을 클릭시 이벤트
        $(document).on('click','[data-idx]',function(){
            boardView($(this).data('idx'));
        });

        $(document).on('click','[data-file-download]',fileDown);

        $(document).on('click','[data-file-delete]',deleteOfFile);
        
        $(document).on('click','[data-comment-remove]',removeOfComment);

        boaStatus.selectedIndexChanged.addHandler((s,e)=>{
            console.debug("111");
            //초기값 셋팅시 수정안함.
            if(s.isUpdating) return;
            
            confirm('상담 상태를 수정 하시겠습니까?','상담 상태가 수정됩니다.',consts.MSGBOX.QUESTION,()=>{
                let idx = $('#boaIdx').val();
                let params = {
                    uri: `boards/status/${idx}`,
                    boaStatus: s.selectedValue
                }
                ajax.putAjax(params,true).then(async ()=>{
                    boardView(idx);
                    pushMsg('상담상태가 수정 되었습니다.');
                }).catch((e)=>{});
            });
        });

        //상담상태 셋팅
        commonRestApi.getCommonCode('1001').then((data)=>{
            let boaStatusCol = grid._flexGrid.getColumn('boaStatus');
            boaStatusCol.dataMap = new wijmo.grid.DataMap(data['commonCodeList'],'codCode','codName');
            boaStatus.beginUpdate();
            boaStatus.itemsSource = data['commonCodeList'];
            boaStatus.endUpdate();
        });

    }

      
    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        input.nextFocusEvent('#searchEnddat','#btn-search');
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
    board.init();
    
});
