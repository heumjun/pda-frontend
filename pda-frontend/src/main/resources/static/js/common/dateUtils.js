/// <reference path ="../../vendors/dayjs/dayjs.d.ts"/>
/// <reference path ="../../vendors/dayjs/plugin/duration/index.d.ts"/>
/// <reference path ="../../vendors/dayjs/plugin/isBetween/index.d.ts"/>

/**
 * 날짜관련 공통 모듈 
 */


import dayjs from "../../vendors/dayjs/dayjs.js";
import ko from "../../vendors/dayjs/locale/ko.js";
import duration from "../../vendors/dayjs/plugin/duration/index.js";
import isBetween from "../../vendors/dayjs/plugin/isBetween/index.js";
import { number } from "./wijmo/inputFactory.js";
//날짜관련 함수  https://day.js.org/docs/en/installation/node-js

//한국어 표시
dayjs.locale('ko',ko);
dayjs.extend(duration);
dayjs.extend(isBetween);

const dateFormat = "YYYY-MM-DD";



/**
 * dayjs 객체로 customize 필요할 경우
 * @param {String} date 셋팅날짜 (옵션) 없을경우 오늘날짜 셋팅됨.
 * @returns dayjs 객체
 */
export const getDayjs = (date)=>{

    return dayjs(date);
}

/**
 * 시작일자부터 종료일자 까지의 차이를 년,월,일로 반환한다.
 * ex) 2022-08-01, 2023-10-31 => 1년 3개월 1일
 * duration.years(), duration.months(), duration.days()  산출가능
 * 참고 사이트 https://umanking.github.io/2023/08/15/dayjs-duration/
 * 
 * @param {String} sdat 시작일자
 * @param {String} edat 종료일자
 * @returns duration 객체
 */
export const getDateDiffYYMMDD = (sdat,edat)=>{
    let startday = dayjs(sdat);
    let endday = dayjs(edat);
    return dayjs.duration(endday.diff(startday));
}

/**
 * Date type 형태를 format 형태로 변경.
 * @param {date} date 
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 */
export const formatDate = (date,format)=>{
    date = date.toString();
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(date).format(format);
}


/**
 * 오늘날짜 
 * https://day.js.org/docs/en/display/format 포맷 참조
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * @returns String
 */
export const today = (format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs().format(format);
}

/**
 * 파라미터 월의 말일
 * @param {String} date 해당년월
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * * @returns String
 */

export const lastDayOfMonth = (date,format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(date).endOf('M').format(format);
}

/**
 * 파라미터 월의 1일
 * @param {String} date 해당년월
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * * @returns String
 */
export const firstDayOfMonth = (date,format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(date).startOf('M').format(format);
}

/**
 * 이번달 말일
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 */
export const lastDayOfThisMonth = (format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(new Date()).endOf('M').format(format);
}

/**
 * 이번달 1일
 * @param {String} format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 */
export const firstDayOfThisMonth = (format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(new Date()).startOf('M').format(format);
}

/**
 * 년수 더하기
 * @param {String} date 날짜
 * @param {Number} year 더할 년수
 * @param {STring} format format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * @returns 
 */
export const addYear = (date,year,format)=>{
    return addDate(date,year,'year',format);
}

/**
 * 월수 더하기
 * @param {String} date 날짜
 * @param {Number} year 더할 월수
 * @param {STring} format format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * @returns 
 */
export const addMonth = (date,year,format)=>{
    return addDate(date,year,'month',format);
}

/**
 * 주수 더하기
 * @param {String} date 날짜
 * @param {Number} year 더할 주수
 * @param {STring} format format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * @returns 
 */
export const addWeek = (date,year,format)=>{
    return addDate(date,year,'week',format);
}

/**
 * 일수 더하기
 * @param {String} date 날짜
 * @param {Number} year 더할 일수
 * @param {STring} format format "YYYY-MM-DDTHH:mm:ssZ[Z]" (옵션)
 * @returns 
 */
export const addDay = (date,year,format)=>{
    return addDate(date,year,'day',format);
}

/**
 * 나이계산
 * @param {date} birth 생일
 */
export const calculateAge = (birth) => {

    let currentDate = dayjs();
    let birthDate = dayjs(birth,{format:'YYYYMMDD'});
    let age = currentDate.year() - birthDate.year();

    
    if(currentDate.month() < birthDate.month() || (currentDate.month() === birthDate.month() && currentDate.date() < birthDate.date())){
        return age -1;
    }
    return age;


}

const addDate = (date,num,unit,format)=>{
    if(wijmo.isEmpty(format)) format = dateFormat;
    return dayjs(date).add(num,unit).format(format);
}





