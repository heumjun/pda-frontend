/*
 * jQuery Scanner Detection
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Scanner-Detection
 *
 * Version: 1.2.1
 *
 */
/**
 * 아스키 코드표
 * Enter는   13 :  CR
 *  8 : backspace
 *  9 : tab
 * 10 : line feed
 * 텍스트 파일은 Enter 가  CR + LF 로 구성되는곳도 있음
 * 10진수    ASCII    10진수    ASCII
 * --------------------------------------
 * 0        NULL     64        @
 * 1        SOH      65        A
 * 2        STX      66        B
 * 3        ETX      67        C
 * 4        EOT      68        D
 * 5        ENQ      69        E
 * 6        ACK      70        F
 * 7        BEL      71        G
 * 8        BS       72        H
 * 9        HT       73        I
 * 10       LF       74        J
 * 11       VT       75        K
 * 12       FF       76        L
 * 13       CR       77        M
 * 14       SO       78        N
 * 15       SI       79        O
 * 16       DLE      80        P
 * 17       DC1      81        Q
 * 18       SC2      82        R
 * 19       SC3      83        S
 * 20       SC4      84        T
 * 21       NAK      85        U
 * 22       SYN      86        V
 * 23       ETB      87        W
 * 24       CAN      88        X
 * 25       EM       89        Y
 * 26       SUB      90        Z
 * 27       ESC      91        [
 * 28       FS       92        \
 * 29       GS       93        ]
 * 30       RS       94        ^
 * 31       US       95        _
 * 32       SP       96        .
 * 33       !        97        a
 * 34       "        98        b
 * 35       #        99        c
 * 36       $        100       d
 * 37       %        101       e
 * 38       &        102       f
 * 39       '        103       g
 * 40       (        104       h
 * 41       )        105       i
 * 42       *        106       j
 * 43       +        107       k
 * 44       '        108       l
 * 45       -        109       m
 * 46       .        110       n
 * 47       /        111       o
 * 48       0        112       p
 * 49       1        113       q
 * 50       2        114       r
 * 51       3        115       s
 * 52       4        116       t
 * 53       5        117       u
 * 54       6        118       v
 * 55       7        119       w
 * 56       8        120       x
 * 57       9        121       y
 * 58       :        122       z
 * 59       ;        123       {
 * 60	    <	     124	   |
 * 61	    =	     125	   }
 * 62       >        126       ~
 * 63       ?        127       DEL
 * ---------------------------------
 */
(function($){
    $.fn.scannerDetection=function(options){

        let keyupEvtRunYn = true; // keyup 이벤트만 생성되었을때 공백문자 받기

        // If string given, call onComplete callback
        if(typeof options==="string"){
            this.each(function(){
                this.scannerDetectionTest(options);
            });
            return this;
        }

        // If false (boolean) given, deinitialize plugin
        if(options === false){
            this.each(function(){
                this.scannerDetectionOff();
            });
            return this;
        }

        var defaults={
            onComplete:false, // Callback after detection of a successfull scanning (scanned string in parameter)
            onError:false, // Callback after detection of a unsuccessfull scanning (scanned string in parameter)
            onReceive:false, // Callback after receiving and processing a char (scanned char in parameter)
            onKeyDetect:false, // Callback after detecting a keyDown (key char in parameter) - in contrast to onReceive, this fires for non-character keys like tab, arrows, etc. too!
            timeBeforeScanTest:100, // Wait duration (ms) after keypress event to check if scanning is finished
            avgTimeByChar:30, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
            minLength:6, // Minimum length for a scanning
            endChar:[9,13], // Chars to remove and means end of scanning
            startChar:[], // Chars to remove and means start of scanning
            changeChar:[],
            removeChar:[4, 29, 30], // characters to exclude (4 : EOT, 29 : GS, 30 : RS)
            ignoreIfFocusOn:false, // do not handle scans if the currently focused element matches this selector
            scanButtonKeyCode:false, // Key code of the scanner hardware button (if the scanner button a acts as a key itself)
            scanButtonLongPressThreshold:3, // How many times the hardware button should issue a pressed event before a barcode is read to detect a longpress
            onScanButtonLongPressed:false, // Callback after detection of a successfull scan while the scan button was pressed and held down
            stopPropagation:false, // Stop immediate propagation on keypress event
            preventDefault:false // Prevent default action on keypress event
        };
        if(typeof options==="function"){
            options={onComplete:options}
        }
        if(typeof options!=="object"){
            options=$.extend({},defaults);
        }else{
            options=$.extend({},defaults,options);
        }

        this.each(function(){
            var self=this, $self=$(self), firstCharTime=0, lastCharTime=0, stringWriting='', callIsScanner=false, testTimer=false, scanButtonCounter=0;
            var initScannerDetection=function(){
                firstCharTime=0;
                stringWriting='';
                scanButtonCounter=0;
            };
            self.scannerDetectionOff=function(){
                $self.unbind('keydown.scannerDetection');
                $self.unbind('keypress.scannerDetection');

                $self.unbind('keyup.scannerDetection');
            }
            self.isFocusOnIgnoredElement=function(){
                if(!options.ignoreIfFocusOn) return false;
                if(typeof options.ignoreIfFocusOn === 'string') return $(':focus').is(options.ignoreIfFocusOn);
                if(typeof options.ignoreIfFocusOn === 'object' && options.ignoreIfFocusOn.length){
                    var focused=$(':focus');
                    for(var i=0; i<options.ignoreIfFocusOn.length; i++){
                        if(focused.is(options.ignoreIfFocusOn[i])){
                            return true;
                        }
                    }
                }
                return false;
            }
            self.scannerDetectionTest=function(s){
                // If string is given, test it
                if(s){
                    firstCharTime=lastCharTime=0;
                    stringWriting=s;
                }

                if (!scanButtonCounter){
                    scanButtonCounter = 1;
                }

                // If all condition are good (length, time...), call the callback and re-initialize the plugin for next scanning
                // Else, just re-initialize
                if(stringWriting.length>=options.minLength && lastCharTime-firstCharTime<stringWriting.length*options.avgTimeByChar){
                    if(options.onScanButtonLongPressed && scanButtonCounter > options.scanButtonLongPressThreshold) options.onScanButtonLongPressed.call(self,stringWriting,scanButtonCounter);
                    else if(options.onComplete) options.onComplete.call(self,stringWriting,scanButtonCounter);
                    $self.trigger('scannerDetectionComplete',{string:stringWriting});
                    initScannerDetection();
                    return true;
                }else{
                    if(options.onError) options.onError.call(self,stringWriting);
                    $self.trigger('scannerDetectionError',{string:stringWriting});
                    initScannerDetection();
                    return false;
                }
            }

            // 원본 시작
            // $self.data('scannerDetection',{options:options}).unbind('.scannerDetection').bind('keydown.scannerDetection',function(e){
            //     console.log("keydown.scannerDetection start......");
            //     keyupEvtRunYn = false;
            //     // If it's just the button of the scanner, ignore it and wait for the real input
            //     if(options.scanButtonKeyCode !== false && e.which==options.scanButtonKeyCode) {
            //         scanButtonCounter++;
            //         // Cancel default
            //         e.preventDefault();
            //         e.stopImmediatePropagation();
            //     }
            //     // Add event on keydown because keypress is not triggered for non character keys (tab, up, down...)
            //     // So need that to check endChar and startChar (that is often tab or enter) and call keypress if necessary
            //     else if((firstCharTime && options.endChar.indexOf(e.which)!==-1)
            //     || (!firstCharTime && options.startChar.indexOf(e.which)!==-1)){
            //         console.log("keypress event start......");
            //         // Clone event, set type and trigger it
            //         var e2=jQuery.Event('keypress',e);
            //         e2.type='keypress.scannerDetection';
            //         $self.triggerHandler(e2);
            //
            //         var e3=jQuery.Event('keyup',e);
            //         e3.type='keyup.scannerDetection';
            //         $self.triggerHandler(e3);
            //
            //         // Cancel default
            //         e.preventDefault();
            //         e.stopImmediatePropagation();
            //     }
            //     // Fire keyDetect event in any case!
            //     if(options.onKeyDetect) options.onKeyDetect.call(self,e);
            //     $self.trigger('scannerDetectionKeyDetect',{evt:e});
            //
            // }).bind('keypress.scannerDetection',function(e){
            //     console.log("keypress.scannerDetection start......");
            //     console.log("all data which ["+e.which+"]");
            //     keyupEvtRunYn = false;
            //     if (this.isFocusOnIgnoredElement()) return;
            //     if(options.stopPropagation) e.stopImmediatePropagation();
            //     if(options.preventDefault) e.preventDefault();
            //
            //     if(firstCharTime && options.endChar.indexOf(e.which)!==-1){
            //         e.preventDefault();
            //         e.stopImmediatePropagation();
            //         callIsScanner=true;
            //     }else if(!firstCharTime && options.startChar.indexOf(e.which)!==-1){
            //         e.preventDefault();
            //         e.stopImmediatePropagation();
            //         callIsScanner=false;
            //     }else{
            //         if (typeof(e.which) != 'undefined'){
            //             console.log("e.which ["+e.which+"]");
            //             stringWriting+=String.fromCharCode(e.which);
            //         }
            //         callIsScanner=false;
            //     }
            //
            //     if(!firstCharTime){
            //         firstCharTime=Date.now();
            //     }
            //     lastCharTime=Date.now();
            //
            //     if(testTimer) clearTimeout(testTimer);
            //     if(callIsScanner){
            //         self.scannerDetectionTest();
            //         testTimer=false;
            //     }else{
            //         testTimer=setTimeout(self.scannerDetectionTest,options.timeBeforeScanTest);
            //     }
            //
            //     if(options.onReceive) options.onReceive.call(self,e);
            //     $self.trigger('scannerDetectionReceive',{evt:e});
            // });
            // // 원본 종료

            let shiftChar = "";
            // 변경
            $self.data('scannerDetection',{options:options}).unbind('.scannerDetection').bind('keydown.scannerDetection',function(e){
                //console.log("keydown.scannerDetection start......");
                keyupEvtRunYn = false;
                // If it's just the button of the scanner, ignore it and wait for the real input
                if(options.scanButtonKeyCode !== false && e.which==options.scanButtonKeyCode) {
                    scanButtonCounter++;
                    // Cancel default
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                    // Add event on keydown because keypress is not triggered for non character keys (tab, up, down...)
                // So need that to check endChar and startChar (that is often tab or enter) and call keypress if necessary
                else if((firstCharTime && options.endChar.indexOf(e.which)!==-1)
                    || (!firstCharTime && options.startChar.indexOf(e.which)!==-1)){
                    //console.log("keypress event start......");
                    // Clone event, set type and trigger it
                    var e2=jQuery.Event('keypress',e);
                    e2.type='keypress.scannerDetection';
                    $self.triggerHandler(e2);

                    var e3=jQuery.Event('keyup',e);
                    e3.type='keyup.scannerDetection';
                    $self.triggerHandler(e3);

                    // Cancel default
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
                // Fire keyDetect event in any case!
                if(options.onKeyDetect) options.onKeyDetect.call(self,e);
                $self.trigger('scannerDetectionKeyDetect',{evt:e});

            }).bind('keypress.scannerDetection',function(e){
                //console.log("keypress.scannerDetection start......");
                //console.log("all data which ["+e.which+"]");
                keyupEvtRunYn = false;
                if (this.isFocusOnIgnoredElement()) return;
                if(options.stopPropagation) e.stopImmediatePropagation();
                if(options.preventDefault) e.preventDefault();

                if(firstCharTime && options.endChar.indexOf(e.which)!==-1){
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner=true;
                }else if(!firstCharTime && options.startChar.indexOf(e.which)!==-1){
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner=false;
                }else{
                    if (typeof(e.which) != 'undefined'){
                        //console.log("e.which ["+e.which+"]" + "["+e.keyCode+"]");
                        if (options.removeChar.indexOf(e.which) == -1) {
                            stringWriting+=String.fromCharCode(e.which);
                        } else {
                            //console.log("Remove char ==================================== :: " + e.keyCode);
                        }

                    }
                    callIsScanner=false;
                }

                if(!firstCharTime){
                    firstCharTime=Date.now();
                }
                lastCharTime=Date.now();

                if(testTimer) clearTimeout(testTimer);
                if(callIsScanner){
                    self.scannerDetectionTest();
                    testTimer=false;
                }else{
                    testTimer=setTimeout(self.scannerDetectionTest,options.timeBeforeScanTest);
                }

                if(options.onReceive) options.onReceive.call(self,e);
                $self.trigger('scannerDetectionReceive',{evt:e});
            }).bind('keyup.scannerDetection',function(e){
                //console.log("keyup.scannerDetection start......");
                if (this.isFocusOnIgnoredElement()) return;
                if(options.stopPropagation) e.stopImmediatePropagation();
                if(options.preventDefault) e.preventDefault();

                if(firstCharTime && options.endChar.indexOf(e.which)!==-1){
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner=true;
                } else {
                    if (typeof(e.which) != 'undefined'){
                        //console.log("keyup>>>>>>>>>" + e.which);
                        if(options.startChar.indexOf(e.which) == -1) {
                            if (e.which == 32) { // 공백문자일때

                                if (keyupEvtRunYn == true) {
                                    //console.log("["+stringWriting+"]");
                                    stringWriting+=String.fromCharCode(e.which);
                                    //console.log("["+stringWriting+"]");
                                }
                            }
                        }
                    }
                    callIsScanner=false;
                }

                keyupEvtRunYn = true; // 초기화

                if(!firstCharTime){
                    firstCharTime=Date.now();
                }
                lastCharTime=Date.now();

                if(testTimer) clearTimeout(testTimer);
                if(callIsScanner){
                    self.scannerDetectionTest();
                    testTimer=false;
                }else{
                    testTimer=setTimeout(self.scannerDetectionTest,options.timeBeforeScanTest);
                }

                if(options.onReceive) options.onReceive.call(self,e);
                $self.trigger('scannerDetectionReceive',{evt:e});
            });

        });

        return this;
    }
})(jQuery);