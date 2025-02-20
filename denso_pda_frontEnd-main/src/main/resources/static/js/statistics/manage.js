import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const manage = function(){

    let healthChart = new wijmo.chart.FlexPie('#healthChart');
    let dietChart = new wijmo.chart.FlexPie('#dietChart');

    //페이지 권한
    let dataParams = $('#data-params').data('params');
    const authrity = {ins:dataParams.athIns,del:dataParams.athDel};
    

    /**
     * 운동프로그램 차트 초기화
     */
    const healthChartInit = ()=>{
        healthChart.bindingName = 'hemName';
        healthChart.binding = 'count';
        healthChart.selectionMode = wijmo.chart.SelectionMode.Point;
        //healthChart.selectedItemPosition = wijmo.chart.Position.Top;
        healthChart.selectedItemOffset = 0.2;
        healthChart.isAnimated = true;
        
        // healthChart.tooltip = {content:''};
        healthChart.palette = ['rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',
            'rgb(208, 245, 76)', 'rgb(198, 250, 163)', 'rgb(247, 243, 13)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)']
        
    }

    
    /**
     * 운동프로그램 가입자수 조회
     */
    const getCustomerCountByHealth = async ()=>{
        
        let params = {
            uri: `code-manage/healths/customers/count`,
        }
        ajax.getAjax(params,true).then(data=>{
            let customerCountList = data['customerCountList'];
            let sum = customerCountList.map(c => c.count).reduce((sum, cur) => sum + cur);
            
            healthChart.dataLabel = {
                content: (ht) => {
                    return `${ht.value}명 (${wijmo.Globalize.format(ht.value / sum, 'p2')})`;
                }
            };

            healthChart.itemsSource = customerCountList;

            pushMsg('조회 되었습니다.');
        }).catch((e)=>{});
    }

    /**
     * 식단프로그램 차트 초기화
     */
    const dietChartInit = ()=>{
        dietChart.bindingName = 'dimName';
        dietChart.binding = 'count';
        dietChart.selectionMode = wijmo.chart.SelectionMode.Point;
        dietChart.selectedItemOffset = 0.2;
        dietChart.isAnimated = true;
        
        dietChart.palette = ['rgb(208, 245, 76)', 'rgb(198, 250, 163)', 'rgb(247, 243, 13)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)',
            'rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',]
        
    }

    /**
     * 식단프로그램 가입자수 조회
     */
    const getCustomerCountByDiet = async ()=>{
        
        let params = {
            uri: `code-manage/diet-menus/customers/count`,
        }
        ajax.getAjax(params,true).then(data=>{
            let customerCountList = data['customerCountList'];
            let sum = customerCountList.map(c => c.count).reduce((sum, cur) => sum + cur);
            
            dietChart.dataLabel = {
                content: (ht) => {
                    return `${ht.value}명 (${wijmo.Globalize.format(ht.value / sum, 'p2')})`;
                }
            };

            dietChart.itemsSource = customerCountList;

            pushMsg('조회 되었습니다.');
        }).catch((e)=>{});
    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{
        healthChartInit();
        dietChartInit();
        $('.btn-health-refresh').on('click',getCustomerCountByHealth);
        $('.btn-diet-refresh').on('click',getCustomerCountByDiet);

        getCustomerCountByHealth();
        getCustomerCountByDiet();
        
    }

    
    /**
     * input 박스에서 엔터키 누를경우 포커스 이동
     */
    const handleFocus = ()=>{
        //input.nextFocusEvent('#이벤트발생 input ID','#이동되는 input ID');
    }

    return{
        init:()=>{
            handleEvent();
            handleFocus();
        }
    }
}();


$(()=>{
    manage.init();
    
});
