
import GridFactory from "../common/wijmo/gridFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import { countUp } from "../common/plugin.js";

const dashboard = function(){

    const echartSetOption = (chart, userOptions, getDefaultOptions) => {
        const themeController = document.body;
        // Merge user options with lodash
        chart.setOption(window._.merge(getDefaultOptions(), userOptions));
      
        themeController.addEventListener('clickControl', ({ detail: { control } }) => {
          if (control === 'theme') {
            chart.setOption(window._.merge(getDefaultOptions(), userOptions));
          }
        });
    };
    
    const makeLineChart = (ele,userOptions)=>{
        let $echartBasicChart = document.querySelector(ele);
        var chart = window.echarts.init($echartBasicChart);
        var getDefaultOptions = function getDefaultOptions() {
           return {        
              color: utils.getColors().primary,
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'none'
                },
                formatter: "{b0} : {c0}명",
                padding: [7, 10],
                backgroundColor: utils.getGrays()['100'],
                borderColor: utils.getGrays()['300'],
                textStyle: {
                  color: utils.getColors().dark
                },
                borderWidth: 1,
                transitionDuration: 0,
                position: function position(pos, params, dom, rect, size) {
                  return getPosition(pos, params, dom, rect, size);
                }
              },
              xAxis: {
                type: 'category',
                show: false,
                boundaryGap: false
              },
              yAxis: {
                show: false,
                type: 'value',
                boundaryGap: false
              },
              series: [{
                type: 'line',
                symbol: 'none',
                smooth: true,
                lineStyle: {width: 2},
                areaStyle: {
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                      offset: 0,
                      color: utils.rgbaColor(utils.getColor('primary'), 0.25)
                    }, {
                      offset: 1,
                      color: utils.rgbaColor(utils.getColor('primary'), 0)
                    }]
                  }
                }
              }],
              grid: {
                bottom: "2%",
                top: "2%",
                right: "0",
                left: "0px"
              }
            };
          };

          echartSetOption(chart, userOptions, getDefaultOptions);
    }

    /**
     * 월별 고객수,운동프로그램가입자,식단프로그램가입자,상담내역 수 차트
     */
    const getMonthlyCount = ()=>{
        
        let userOptions = {
            xAxis: {
                data: null
            },
            series: [
                {
                    data: null,
                    color: "#2c7be5",
                    areaStyle: {
                        color: {
                            colorStops: [
                                {
                                    offset: 0,
                                    color: "rgba(44, 123, 229, .25)"
                                },
                                {
                                    offset: 1,
                                    color: "rgba(44, 123, 229, 0)"
                                }
                            ]
                        }
                    }
                }
            ],
            
        };
        
        
        let params = {
            uri: `dashboard/monthly/count`,
        }
        ajax.getAjax(params,true).then(data=>{
            
            //전체고객수 차트
            $('#customerCount').text('0명');
            let customerCountList = data['customerCountList'];
            if(customerCountList.length > 0){
                let increasePer = parseInt((customerCountList[0].count/customerCountList[customerCountList.length-1].count)*100);
                $('#customerIncreasePer').text(increasePer+'%');
                let xdata = customerCountList.map(d=>d.date);
                let seriesData = customerCountList.map(d=>d.count);
                $('#customerCount').text(seriesData[seriesData.length-1]+'명'); 

                //차트만들기
                userOptions.xAxis.data = xdata;
                userOptions.series[0].data = seriesData;
                makeLineChart('#echart-customers',userOptions);
    
            }
            
            //상담신청건수 차트
            $('#boardCount').text('0명');
            let boardCountList = data['boardCountList'];
            if(boardCountList.length > 0){
                let increasePer = parseInt((boardCountList[0].count/boardCountList[boardCountList.length-1].count)*100);
                $('#boardIncreasePer').text(increasePer+'%');
                let xdata = boardCountList.map(d=>d.date);
                let seriesData = boardCountList.map(d=>d.count);
                $('#boardCount').text(seriesData[seriesData.length-1]+'건'); 

                //차트만들기
                userOptions.xAxis.data = xdata;
                userOptions.series[0].data = seriesData;
                userOptions.series[0].color = "#f5803e";
                userOptions.series[0].areaStyle.color.colorStops[0].color = "rgba(245, 128, 62, .25)";
                userOptions.series[0].areaStyle.color.colorStops[1].color = "rgba(245, 128, 62, 0)";
                makeLineChart('#echart-boards',userOptions);
    
            }

            // 상담대기 내역
            let boardWaitList = data['boardWaitList'];
            $('#boardWaitingList').html('');
            boardWaitList.forEach((item,i)=>{
                $('#boardWaitingList').append(
                    `<tr>
                        <td class="text-truncate">${item.boaTitle}</td>
                        <td class="text-truncate text-end">${item.name}</td>
                        <td class="text-truncate text-end">${dateUtils.formatDate(item.boaDate,'YYYY-MM-DD')}</td>
                    </tr>`
                );
                
            });

            //운동프로그램 별 가입자수
            let customerCountByHealth = data['customerCountByHealth'];
            createCustomerCountByHealthChart(customerCountByHealth);
            

            //식단프로그램 별 가입자수
            let customerCountByDiet = data['customerCountByDiet'];
            createCustomerCountByDietChart(customerCountByDiet);

            //트레이너별 가입자수
            let customerCountByTrainer = data['customerCountByTrainer'];
            createCustomerCountByTrainerChart(customerCountByTrainer);

            //상담 현황
            let boardStatus = data['boardStatus'];
            createBoardStatusByChart(boardStatus);


        }).catch((e)=>console.debug(e));
    }

    const createBoardStatusByChart = (data)=>{
        
        let boardChart = new wijmo.chart.FlexPie('#boardChart');

        boardChart.bindingName = 'status';
        boardChart.binding = 'count';
        // boardChart.selectionMode = wijmo.chart.SelectionMode.Point;
        boardChart.selectedItemOffset = 0.1;
        boardChart.isAnimated = true;
        
        boardChart.palette = ['rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)'];

        // boardChart.palette = ['rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',
        //     'rgb(208, 245, 76)', 'rgb(198, 250, 163)', 'rgb(247, 243, 13)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)']
        
        let sum = data.map(c => c.count).reduce((sum, cur) => sum + cur);
            
        boardChart.dataLabel = {
            content: (ht) => {
                return `${ht.value}명 (${wijmo.Globalize.format(ht.value / sum, 'p2')})`;
            }
        };

        boardChart.itemsSource = data;

    }

    /**
     * 트레이너별 가입자수 차트 만들기
     * @param {*} data 
     */
    const createCustomerCountByTrainerChart = (data)=>{
        let trainerChart = new wijmo.chart.FlexChart('#trainerChart');

        trainerChart.initialize({
            series:[
                {binding:'count',name:'가입자수'},
            ]
        });
        trainerChart.legend.position= wijmo.chart.Position.Bottom;
        trainerChart.bindingX = 'traName';
        trainerChart.selectionMode = wijmo.chart.SelectionMode.Point;
        trainerChart.dataLabel.content = '{y}명';

        trainerChart.palette = ['rgb(97, 160, 194)' ,'rgb(14, 236, 207)','rgb(69, 122, 226)', 'rgb(81, 186, 250)', ];
        // trainerChart.palette = ['rgb(14, 236, 207)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(250, 246, 215)',
        //     'rgb(208, 245, 76)', 'rgb(247, 243, 13)', 'rgb(69, 122, 226)', 'rgb(198, 250, 163)', 'rgba(128,113,90,1)']
        
        let ani = new wijmo.chart.animation.ChartAnimation(trainerChart);
        ani.animationMode = wijmo.chart.animation.AnimationMode.Point;

        trainerChart.itemsSource = data;
    }

    /**
     * 식단 프로그램별 가입자수 차트 만들기
     * @param {*} data 
     */
    const createCustomerCountByDietChart = (data)=>{
        let dietChart = new wijmo.chart.FlexChart('#dietChart');

        dietChart.initialize({
            series:[
                {binding:'count',name:'가입자수'},
            ]
        });
        dietChart.legend.position= wijmo.chart.Position.Bottom;
        dietChart.bindingX = 'dimName';
        dietChart.selectionMode = wijmo.chart.SelectionMode.Point;
        dietChart.dataLabel.content = '{y}명';

        dietChart.palette = ['rgb(81, 186, 250)','rgb(14, 236, 207)','rgb(69, 122, 226)','rgb(97, 160, 194)' ];
        // dietChart.palette = ['rgb(198, 250, 163)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',
        //     'rgb(208, 245, 76)', 'rgb(247, 243, 13)', 'rgb(69, 122, 226)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)']
        
        let ani = new wijmo.chart.animation.ChartAnimation(dietChart);
        ani.animationMode = wijmo.chart.animation.AnimationMode.Point;

        dietChart.itemsSource = data;
    }

    /**
     * 운동프로그램 별 가입자수 차트 만들기
     * @param {} data 
     */
    const createCustomerCountByHealthChart = (data)=>{
        // console.debug(data);
        let healthChart = new wijmo.chart.FlexChart('#healthChart');

        healthChart.initialize({
            series:[
                {binding:'count',name:'가입자수'},
            ]
        });
        healthChart.legend.position= wijmo.chart.Position.Bottom;
        healthChart.bindingX = 'hemName';
        healthChart.selectionMode = wijmo.chart.SelectionMode.Point;
        healthChart.dataLabel.content = '{y}명';

        healthChart.palette = ['rgb(69, 122, 226)', 'rgb(81, 186, 250)', 'rgb(97, 160, 194)', 'rgb(14, 236, 207)',
            'rgb(208, 245, 76)', 'rgb(198, 250, 163)', 'rgb(247, 243, 13)', 'rgb(250, 246, 215)', 'rgba(128,113,90,1)']
        
        let ani = new wijmo.chart.animation.ChartAnimation(healthChart);
        ani.animationMode = wijmo.chart.animation.AnimationMode.Point;

        healthChart.itemsSource = data;
    }



    const handleEvent = ()=>{
        getMonthlyCount();
        $('#boardViewAll').on('click',()=>{
            //tabs.js파일에 있는 addTabBar 함수를 호출해줘
            parent.addTabBar('user/board','상담 관리','관리자 메뉴>고객정보>상담 관리');
        });

    }
    
    return{
        init:()=>{
            handleEvent();
            
        }
    }
}();


//문서(DOM) 로딩후 시작점
$(()=>{
    dashboard.init();
    
});