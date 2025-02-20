/**
 * 외부 플러그인을 사용하기 편하게 공통으로 관리하는 모듈
 */
import { CountUp } from "../../vendors/countup/countUp.min.js";

/**
 * 숫자카운터 애니메이션 효과
 * @param {String} divId 엘리먼트 ID
 * @param {Number} number 카운터할 숫자
 * @param {object} option 옵션사항 ex) {prefix:'&#x20a9;',decimalPlaces:2} 숫자앞에 원화(\)를 붙이고 소숫점2자리 까지 표현
 * countUp.update(1000) 숫자수정가능함.
 * 
 * 옵션사항 (https://github.com/inorganik/countUp.js 참조)
 * startVal?: number; // number to start at (0)
 * decimalPlaces?: number; // number of decimal places (0)
 * duration?: number; // animation duration in seconds (2)
 * useGrouping?: boolean; // example: 1,000 vs 1000 (true)
 * useIndianSeparators?: boolean; // example: 1,00,000 vs 100,000 (false)
 * useEasing?: boolean; // ease animation (true)
 * smartEasingThreshold?: number; // smooth easing for large numbers above this if useEasing (999)
 * smartEasingAmount?: number; // amount to be eased for numbers above threshold (333)
 * separator?: string; // grouping separator (',')
 * decimal?: string; // decimal ('.')
 * // easingFn: easing function for animation (easeOutExpo)
 * easingFn?: (t: number, b: number, c: number, d: number) => number;
 * formattingFn?: (n: number) => string; // this function formats result
 * prefix?: string; // text prepended to result
 * suffix?: string; // text appended to result
 * numerals?: string[]; // numeral glyph substitution
 * enableScrollSpy?: boolean; // start animation when target is in view
 * scrollSpyDelay?: number; // delay (ms) after target comes into view
 * scrollSpyOnce?: boolean; // run only once
 */
export const countUp = (divId,number,option)=>{

    let countUp = new CountUp(divId,number,option);
    countUp.start(); 
    
    return countUp;
}





