 //自动下拉提示AutoComplete
    /*
    params = {
    inputId:"文本框id,必填",
    parentId:"下拉菜单div父div的Id,可选，默认添加到body上",
    className:"下拉菜单的样式,可选",
    firstSelected:"下拉提示第一个是否被选中,true,false,默认true",
    userIe6bug:"是否屏蔽ie6bug,true,false,默认false"
    }
    */
    AutoComplete = function (params) {
        this.init(params);
    }
    AutoComplete.prototype = {
        input: null,
        popup: null,
        //data: null,
        current: -1,
        defaultValue: "",
        parentDoc: null,
        firstSelected: true,
        userIe6bug: false,
        finshFun: function () {
        },
        init: function (params) {
            var that = this;
            that.input = document.getElementById(params.inputId);
            that.popup = document.createElement("div");
            if (!that.isNullOrEmpty(params.className)) {
                that.popup.className = params.className;
            }

            that.data = null;
            if (!that.isNullOrEmpty(params.parentId)) {
                that.parentDoc = document.getElementById(params.parentId);
            } else {
                that.parentDoc = document.body;
            }

            that.parentDoc.appendChild(this.popup);

            that.addEvent(document.body, "click", function () {
                that.popup.style.display = "none";
            })

            if (params.firstSelected === false) {
                that.firstSelected = false;
            }
            if (params.userIe6bug === true) {
                this.userIe6bug = true;
            }
        },
		
		//判断是否为空或者Null
        isNullOrEmpty: function (str) {
            if (str != null && fish.trim(str).length > 0) {
                return false;
            } else {
                return true;
            }
        },
        hide: function () {
            this.popup.style.display = "none";
            this.popup.innerHTML = "";
        },
        show: function (data, isLetter) {

            this.isFinsh = false;
            this.popup.innerHTML = "";

            if (this.userIe6bug === true) {
                this.popup.innerHTML = '<iframe scrolling="no" frameborder="0" class="iframeie6"></iframe>'
            }
            var inputValue = this.input.value.toString();
            this.defaultValue = inputValue;

            var myfdl = document.createElement("dl");
            var myfdt = document.createElement("dt");
            myfdt.innerHTML = "请输入中文/拼音或↑↓键选择";
            myfdl.appendChild(myfdt);

            var aliasName, englishName, abbr;
            var myfdd;
            var rex = new RegExp('^' + inputValue, 'i');
            var e, s; //e = Match English , s = Match Spell

            for (var i = 0; i < data.length; i++) {
                aliasName = data[i].name;
                myfdd = document.createElement("dd");
                myfdd.title = aliasName;
                myfdd.index = i;

                if (isLetter) {
                    e = rex.test(data[i].englishName);
                    s = rex.test(data[i].spell);
                    if (e) { englishName = data[i].englishName; }
                    if (s) { englishName = data[i].spell; }

                    if (e || s) {
                        englishName = englishName.replace(rex, '<span class="pink">' + rex.exec(englishName) + '</span>');
                    }
                    else if (inputValue.length > 1) {
                        e = (data[i].abbr.indexOf(inputValue.toUpperCase()) == 0);
                        s = (data[i].spellAbbr.indexOf(inputValue.toUpperCase()) == 0);

                        if (e || s) {
                            if (e) {
                                englishName = data[i].englishName;
                                abbr = data[i].abbr;
                            }
                            if (s) {
                                englishName = data[i].spell;
                                abbr = data[i].spellAbbr;
                            }
                            var k = 0;
                            var l;
                            var result = '';
                            for (var j = 0; j < englishName.length; j++) {
                                l = englishName.substr(j, 1);
                                if (l == abbr.substr(k, 1)) {
                                    result += '<span class="pink">' + l + '</span>';

                                    k++;
                                    if (k == abbr.length) {
                                        result += englishName.substring(j + 1);
                                        break;
                                    }
                                }
                                else {
                                    result += l;
                                }
                            }
                            englishName = result;
                        }
                    }
                    myfdd.innerHTML = '<span class="cityhy">' + aliasName + '</span><span class="citypy">' + englishName + '</span>';
                }
                else {
                    var regex = new RegExp(inputValue, "gi");
                    aliasName = aliasName.replace(regex, '<span class="pink">' + inputValue + '</span>');
                    myfdd.innerHTML = '<span class="cityhyword">' + aliasName + '</span>';
                }

                myfdl.appendChild(myfdd);

            }

            this.popup.appendChild(myfdl);
            this.popup.style.display = "block";
            this.parentDoc.style.display = "block";
            this.initEvent();
        },
        stopDefaultEvent: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                //IE中阻止函数器默认动作的方式
                window.event.returnValue = false;
            }
            return false;
        },
        //事件
        addEvent: function (element, type, fn) {
            if (document.addEventListener) {
                element.addEventListener(type, fn, false);
            } else if (document.attachEvent) {
                element.attachEvent('on' + type, fn);
            }
        },
        initEvent: function () {
            var that = this;
            var els = that.popup.getElementsByTagName("dd");

            if (that.firstSelected) {
                if (els.length > 0) {
                    els[0].className = "on";
                    that.current = 0;
                }
            }

            var clearListStyle = function () {
                for (var i = 0; i < els.length; i++) {
                    els[i].className = "";
                }
            }

            var inputTextValue = function (key) {
                that.input.value = key;
            }

            that.input.onkeydown = function (event) {
                event = event || window.event;

                if (event.keyCode == 40) {
                    clearListStyle();
                    //Down
                    that.current++;
                    if (that.current >= els.length) {
                        that.current = -1;
                        inputTextValue(that.defaultValue)
                    } else {
                        els[that.current].className = "on";
                        inputTextValue(els[that.current].title.toString())
                    }


                    that.stopDefaultEvent(event);

                } else if (event.keyCode == 38) {
                    //UP
                    clearListStyle();
                    that.current--;
                    if (that.current <= -1) {
                        that.current = els.length;
                        inputTextValue(that.defaultValue)
                    } else {
                        els[that.current].className = "on";
                        inputTextValue(els[that.current].title.toString())
                    }
                } else if (event.keyCode == 13) {
                    //Enter
                    if (that.current > -1 && that.current < els.length) {
                        inputTextValue(els[that.current].title.toString());
                    }
                    that.popup.style.display = "none";
                    that.current = -1;
                    that.finshFun();
                }
            }

            for (var i = 0; i < els.length; i++) {
                els[i].onmouseover = function (event) {
                    clearListStyle();
                    this.className = "on";
                    that.current = this.index;
                }
                els[i].onclick = function (event) {
                    that.current = -1;
                    inputTextValue(this.title.toString());
                    that.popup.style.display = "none";

                    if (that.input.id == "txtHotelInfo") {
                        if (typeof (o) != "undefined") { o.params['ct'].value = '2'; }
                        if (fish.one("#ct").length > 0) { fish.one("#ct").val("2"); }
                    }
                    else {
                        if (typeof (o) != "undefined") { o.params['kt'].value = '2'; }
                        if (fish.one("#kt").length > 0) { fish.one("#kt").val("2"); }
                    }
                }
            }
        }
    }
    AutoComplete.prototype.constructor = AutoComplete;
﻿

	 var SearchFor ={
		//城市提示对象
		autoComplete : null,
		//关键字提示对象
		autoCompleteKeyword : null,
		//最后输入内容
		latestValue : null,
		lastestCityValue : '',
		//提示延迟
		tipsTimeout : null,
		cityDefaultValue : "城市名称",
		//关键字文本框默认值
		locationsDefaultValue : "可输入地址/商圈/地标等",
		keyword:"",
		init : function () {
			var that = this;
			
			
			this.autoComplete = new AutoComplete({
					inputId : "txtHotelInfo",
					parentId : "CitiesSuggestion",
					className : "citybox_shu",
					firseSelected : true,
					userIe6bug : true
				});

			fish.on("keyup",
			
				function (event) {
				if (event.keyCode != 13 && event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 9) {
					var value = fish.one("#txtHotelInfo").val();
					that.latestValue = value;
					//fish("#HotCities").hide();
					if (fish.trim(value) != "") {
						that.tipsTimeout = window.setTimeout(function () {
								that.showCityTips(value);
							}, 200)
					} else {
						that.autoComplete.hide();
					}
				} else if (event.keyCode == 13) {
					
					goUrl();
				}
			}
			
			,"#txtHotelInfo");
			
			
			
		},
		showCityTips : function (keyword){
				that= this;
		that.keyword = keyword;
			
			var that = this;
			fish.ajax({
				url : "http://www.17u.cn/Hotel/DefaultAjaxCallSubmit.aspx?action=GetXmlTagByKeys" ,
				data:"cityName="+ encodeURI("苏州")+"&keyType=0&" +"keys=" + encodeURI(keyword),
				type:"jsonp"
			});
		}
		
	
	}
	/*
	//SearchFor = SearchFor;
	fish.extend({
		searchFor:SearchFor();
	});
	
*/

function fillTagByKeys(result) {

	//if (that.keyword == that.latestValue) {
		var iskeyLetter = false; // isLetter(keyword);
		var obj = eval("(" + result + ")");
		
		if (obj != null && obj.length > 0) {
			
			var data = obj;
			var len = data.length;

			if (data != null && data.length > 0) {
				SearchFor.autoComplete.show(data, iskeyLetter);
			} else {
				SearchFor.autoComplete.hide();
			}
			// fish("#divNoCity").hide();
		} else {
			SearchFor.autoComplete.hide();
			// fish("#divNoCity").show();
		}
	//}
}

SearchFor.init();


