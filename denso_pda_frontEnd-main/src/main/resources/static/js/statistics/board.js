import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const board = function(){

    let boardChart = new wijmo.chart.FlexChart('#boardChart');
    let searchStartdat = input.date('#searchStartdat',dateUtils.firstDayOfThisMonth('YYYY-MM-DD'));
    let searchEnddat = input.date('#searchEnddat',dateUtils.lastDayOfThisMonth('YYYY-MM-DD'));
    
    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    
    
    /**
     * 운동프로그램 차트 초기화
     */
    const boardChartInit = ()=>{
        boardChart.initialize({
            series:[
                {binding:'boardCnt',name:'상담 건수'},
                {binding:'wanCnt',name:'상담 완료수'},
            ]
        });
        boardChart.legend.position= wijmo.chart.Position.Right;
        boardChart.bindingX = 'traName';
        boardChart.selectionMode = wijmo.chart.SelectionMode.Point;

        boardChart.palette = ['rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',
            'rgb(208, 245, 76)', 'rgb(198, 250, 163)', 'rgb(247, 243, 13)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)']
        
        let ani = new wijmo.chart.animation.ChartAnimation(boardChart);
        ani.animationMode = wijmo.chart.animation.AnimationMode.Point;
    }

    
    /**
     * 트레이너별 상담건수
     */
    const getBoardCountByTrainer = async ()=>{
        
        let params = {
            uri: `boards/trainers/count`,
            searchStartdat: searchStartdat.text,
            searchEnddat:searchEnddat.text

        }
        ajax.getAjax(params,true).then(data=>{
            let boardCountList = data['boardCountList'];
            boardChart.itemsSource = boardCountList;

            pushMsg('조회 되었습니다.');
        }).catch((e)=>{});
    }

    

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{
        boardChartInit();
        
        $('#btn-search').on('click',getBoardCountByTrainer);
        
        getBoardCountByTrainer();
        
        
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
        }
    }
}();


$(()=>{
    board.init();
    
});
