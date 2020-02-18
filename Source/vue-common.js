
Vue.prototype.cr = new CommonRequest();
Vue.prototype.sortByKey = sortByKey;
Vue.prototype.shuffle = shuffle;
Vue.prototype.formatTime = formatTime;
Vue.prototype.getDialog = getDialog;
Vue.prototype.getBubbles = getBubbles;
Vue.prototype.getLines = getLines;
Vue.prototype.getConfetti = getConfetti;
Vue.prototype.getSquares = getSquares;
Vue.prototype.getRandom = getRandom;
Vue.prototype.showGritter = showGritter;
Vue.prototype.getColorbox = getColorbox;
Vue.prototype.getChosen = getChosen;
Vue.prototype.getMultiselect = getMultiselect;
Vue.prototype.getUpload = getUpload;
Vue.prototype.daterangePicker = daterangePicker;
Vue.prototype.getNameByKey = getNameByKey;
Vue.prototype.getDuallistbox = getDuallistbox;

/*
 * 通用请求类
 */
function CommonRequest() {
  this.type = 'GET';// 请求方式 POST PUT DELETE
  this.data = {};// 注意数据序列化引起的编码问题,URIencode加密与URIdecode解密
  this.async = true;// 默认异步请求
  // processData: false, contentType: false,多用来处理异步上传二进制文件
  this.processData = true;
  this.contentType = 'application/x-www-form-urlencoded';
  // 是否缓存 ,去除缓存cache:false,ifModified:true
  this.cache = true;
  this.ifModified = false;

  this.__proto__ = {
    /* ajaxSettings：用户输入的ajax请求参数
     * callFun:回调函数,可选nn
     * */
    genernalAjax(ajaxSettings, callFun) {
      const that = this;

      $.ajax({
        url: ajaxSettings.url,
        type: $.isEmptyObject(ajaxSettings.type) ? that.type : ajaxSettings.type,
        data: $.isEmptyObject(ajaxSettings.data) ? that.data : ajaxSettings.data,
        async: (ajaxSettings.async == undefined) ? that.async : ajaxSettings.async,
        processData: (ajaxSettings.processData == undefined) ? that.processData : ajaxSettings.processData,
        contentType: (ajaxSettings.contentType == undefined) ? that.contentType : ajaxSettings.contentType,
        cache: (ajaxSettings.cache == undefined) ? that.cache : ajaxSettings.cache,
        ifModified: (ajaxSettings.ifModified == undefined) ? that.ifModified : ajaxSettings.data,
        success(result) {
          if (result.errorCode == 0) { // errorCode为0表示操作成功
            if ($.isFunction(callFun)) {
              callFun(result); // 回调函数不为null则调用回调函数
            }
          } else {
            $.gritter.add({ // gritter:弹框小插件
              title: '<i class="icon-warning-sign bigger-120"></i> 提示',
              // 显示错误信息，为返回的errorMsg
              text: `<label style='font-size:20px;font-weight:bold'>${result.errorMsg}</label>`,
              class_name: 'gritter-error gritter-center center', // 弹框样式为错误提示，弹框居中，里面的内容居中
              time: 3000,
            });
            if (ajaxSettings.vue != undefined) {
              ajaxSettings.vue.submit = false;
              $(document).find('.dialog-overlay').remove();
            }
          }
        },
        error(error) {
          const errorInfo = '系统维护中...';
          $.gritter.add({
            title: '<i class="icon-warning-sign bigger-120"></i> 提示',
            text: `${"<h1 class='header' style='border-bottom:none;'>"
            + "<i class='icon-wrench icon-animated-wrench bigger-125'></i>"}${errorInfo}</h1>`,
            class_name: 'gritter-info gritter-center center',
            sticky: true,
          });
        },
        complete(XHR, TS) { // ajax完成时，不管成没成功时调用xhr - 包含 XMLHttpRequest 对象
          XHR = null; // 清空ajax请求
        },

      });
    },
  };
}

jQuery(($) => {
  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  // 例子：
  // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
  // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
  // author: meizz
  Date.prototype.Format = function (fmt) {
    const o = {
      'M+': this.getMonth() + 1, // 月份
      'd+': this.getDate(), // 日
      'h+': this.getHours(), // 小时
      'm+': this.getMinutes(), // 分
      's+': this.getSeconds(), // 秒
      'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
      S: this.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
    for (const k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
          : ((`00${o[k]}`).substr((`${o[k]}`).length)));
      }
    }
    return fmt;
  };
});

/*
 * 时间格式化
 * @Param time:Date
 * @Param format:String 格式化的时间样式
 */
function formatTime(time, format) {
  format = format == undefined ? 'yyyy-MM-dd hh:mm:ss' : format;
  return new Date(time).Format(format);
}

/*
 * 数组对象排序
 * @Param array:Array
 * @Param key:String 要排序的key
 */
function sortByKey(array, key) {
  return array.sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

/*
 * 数组乱序
 * @Param array:Array
 */
function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const index = Math.floor(Math.random() * (i + 1));
    const temp = array[index];
    array[index] = array[i];
    array[i] = temp;
  }
  return array;
}


/*
 * Jquery-UI-Dialog
 * @Param ele:String 页面元素id
 * @Param options:Object 用户参数
 * @Param callFun:Function 按钮确定的回调函数
 */
function getDialog(ele, options, callFun) {
  // 默认参数
  const dialogOptions = {
    title_html: true,
    resizable: true,
    draggable: true,
    modal: true,
    width: 500,
    height: 'auto',
    maxHeight: 600,
    closeText: '关闭',
    dialogClass: 'center',
    open() {
      $('button.ui-dialog-titlebar-close').css('color', 'white');
    },
    buttons: [{
      html: "<i class='icon-remove bigger-120'></i>&nbsp;取消",
      class: 'btn btn-xs',
      click() {
        $(this).dialog('close');
      },
    }, {
      html: "<i class='icon-ok bigger-120'></i>&nbsp;确定",
      class: 'btn btn-success btn-xs',
      type: 'submit',
      click() {
        const divEle = $('<div></div>').addClass('dialog-overlay')
          .append($('<div></div>').addClass('container icon-3x')
            .append($('<i></i>').addClass('icon-spin icon-spinner'))
            .append($('<b>提交中...</b>').css('margin-left', '5%')));
        if (callFun) {
          callFun(divEle);
        } else {
          $(this).dialog('close');
        }
      },
    }],
  };

  // 变更默认参数
  for (const k in options) {
    dialogOptions[k] = options[k];
  }
  $(ele).parent().find('.dialog-overlay').remove();
  $(ele).removeClass('hide').dialog(dialogOptions);
}

/*
 * 气泡动画
 */
function getBubbles() {
  $.each($('.particle-text.bubbles'), function () {
    const bubbleNum = ($(this).find('.text').width() / 50) * 10;
    for (let i = 0; i <= bubbleNum; i++) {
      const size = getRandom(6, 12);
      const spanEle = $('<span></span').addClass('particle').css({
        top: `${getRandom(20, 80)}%`,
        left: `${getRandom(0, 95)}%`,
        width: `${size}px`,
        height: `${size}px`,
        'animation-delay': `${getRandom(0, 30)}s`,
      });
      $(this).append(spanEle);
    }
  });
}
/*
 * 线条动画
 */
function getLines() {
  $.each($('.particle-text.lines'), function () {
    const lineNum = ($(this).find('.text').width() / 50) * 10;
    for (let i = 0; i <= lineNum; i++) {
      const spanEle = $('<span></span').addClass('particle').css({
        top: `${getRandom(-30, 50)}%`,
        left: `${getRandom(-10, 110)}%`,
        width: `${getRandom(1, 3)}px`,
        height: `${getRandom(20, 80)}px`,
        'animation-delay': `${getRandom(0, 30) / 10}s`,
      });
      $(this).append(spanEle);
    }
  });
}
/*
 * 彩色纸屑动画
 */
function getConfetti() {
  $.each($('.particle-text.confetti'), function () {
    const confettiNum = ($(this).find('.text').width() / 50) * 10;
    for (let i = 0; i <= confettiNum; i++) {
      const spanEle = $('<span></span').addClass('particle').addClass(`c${getRandom(1, 2)}`)
        .css({
          top: `${getRandom(10, 50)}%`,
          left: `${getRandom(0, 100)}%`,
          width: `${getRandom(6, 8)}px`,
          height: `${getRandom(3, 4)}px`,
          'animation-delay': `${getRandom(0, 30) / 10}s`,
        });
      $(this).append(spanEle);
    }
  });
}

/*
 * 方块气泡动画
 * @Param number:Integer 方块数量
 * @Param ele:String 页面元素
 */
function getSquares(number, ele) {
  for (let i = 0; i < number; i++) {
    const size = `${getRandom(10, 160)}px`;
    const liEle = $('<li></li>').addClass('bubble').css({
      width: size,
      height: size,
      left: `${getRandom(10, 90)}%`,
      'animation-delay': `${getRandom(2, 20)}s`,
      'animation-duration': `${getRandom(10, 30)}s`,
    });
    $(ele).append(liEle);
  }
}


/*
 * 获取区间的随机数
 * @Param min:Integer 区间最小值
 * @Param max:Integer 区间最大值
 */
function getRandom(min, max) {
  min = parseInt(min);
  max = parseInt(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
 * 显示gritter弹框
 * @Param options:Object gritter参数
 * @Param options.title:String 标题
 * @Param options.icon:String 文本icon
 * @Param options.text:String 文本
 * @Param options.className:String 弹框class
 * @Param options.sticky:Boolean 是否固定
 * @Param options.time:Integer 时间
 * @Param options.image:String 是否有图片
 * @Param callFun:Function 回调函数
 */
function showGritter(options, callFun) {
  const title = options.title ? options.title : '';
  const textIcon = options.icon ? options.icon : 'icon-warning-sign bigger-120';
  const textEle = $('<div></div>').append($('<h2></h2>').append(
    $('<i></i>').addClass(textIcon),
  ).append(`&nbsp;${options.text}`));
  const className = options.className ? options.className : 'gritter-error gritter-center center';
  const sticky = options.sticky ? options.sticky : false;
  const time = options.time ? options.time : 200;
  const image = options.image ? options.image : '';
  $.gritter.add({
    title,
    text: textEle.html(),
    class_name: className,
    sticky,
    time,
    image,
  });
  const delay = time + 500;
  setTimeout(() => {
    if (callFun) {
      callFun();
    }
  }, delay);
}


/*
 * colorbox图片显示
 * @Param options:Object colorbox参数
 * @Param callFun:Function 回调函数
 */
function getColorbox(options, callFun) {
  // 默认参数
  const colorbox_params = {
    photo: true,
    reposition: true,
    scalePhotos: false,
    scrolling: true,
    previous: null,
    next: null,
    close: '<i class="icon-remove"></i>',
    current: null,
    maxWidth: '100%',
    maxHeight: '100%',
    onOpen() {
      document.body.style.overflow = 'auto';
      $('#cboxPrevious').remove();
      $('#cboxNext').remove();
    },
    onClosed() {
      document.body.style.overflow = 'auto';
    },
    onComplete() {
      $.colorbox.resize();
    },
  };
  if (!$.isEmptyObject(options)) {
    for (const k in options) {
      colorbox_params[k] = options[k];
    }
  }

  $('a[data-rel="colorbox"]').colorbox(colorbox_params);
  $('#cboxLoadingGraphic').empty();
  $('#cboxLoadingGraphic').append("<i class='icon-spinner orange'></i>");
  if (callFun) {
    callFun();
  }
}

/*
 * chosenselect选项菜单
 * @Param ele:String 页面元素
 * @Param options:Object chosenselect参数
 * @Param callFun:Function 回调函数
 * 默认单选
 */
function getChosen(options, callFun) {
  const chosen_params = {
    width: '100%',
    allow_single_deselect: true,
    placeholder_text_single: '请选择',
    search_contains: true, // 模糊搜索
    no_results_text: '未找到此选项!', // 搜索结果未匹配提示语
  };

  for (const k in options) {
    chosen_params[k] = options[k];
  }

  $(options.ele).chosen(chosen_params).on('change', function () {
    if (callFun) {
      const value = $(this).val();
      callFun(value);
    }
  });
}

/*
 * multiselect选项菜单
 * @Param options:Object multiselect参数
 * @Param options.ele:String 页面元素
 * @Param callFun:Function 回调函数
 * 默认多选
 */
function getMultiselect(options, callFun) {
  const multi_params = {
    enableFiltering: true,
    enableHTML: true,
    buttonClass: 'btn btn-white btn-primary',
    includeSelectAllOption: true,
    enableCaseInsensitiveFiltering: true,
    enableClickableOptGroups: true,
    allSelectedText: null,
    selectAllText: '全选',
    filterPlaceholder: '搜索',
    nonSelectedText: '请选择',
    numberDisplayed: 100,
    maxHeight: 300,
    buttonWidth: '100%',
    templates: {
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"><span class="multiselect-selected-text"></span> &nbsp;<b class="icon-caret-down"></b></button>',
      ul: '<ul class="multiselect-container dropdown-menu"></ul>',
      filter: '<li class="multiselect-item filter"><div class="input-group"><span class="input-group-addon"><i class="icon-search"></i></span><input class="form-control multiselect-search" type="text"></div></li>',
      filterClearBtn: '<span class="input-group-btn"><button class="btn btn-white multiselect-clear-filter" type="button"><i class="icon-remove-sign red"></i></button></span>',
      li: '<li><a tabindex="0"><label></label></a></li>',
      divider: '<li class="multiselect-item divider"></li>',
      liGroup: '<li class="multiselect-item multiselect-group"><label></label></li>',
    },
    onDropdownHide() {

    },
    onChange() {

    },
  };

  for (const k in options) {
    multi_params[k] = options[k];
  }

  $(options.ele).multiselect(multi_params);

  if (callFun) {
    callFun();
  }
}

/*
 * duallistbox
 * @Param options:Object duallistbox参数
 * @Param options.ele:String 页面元素
 * @Param callFun:Function 回调函数
 * 默认多选
 */

function getDuallistbox(options, callFun) {
  const dual_params = {
    infoTextFiltered: '<span class="label label-inverse label-lg">搜索人员</span>',
    filterTextClear: '显示全部',
    filterPlaceHolder: '人员搜索',
    buttonClass: 'btn-primary',
    moveAllLabel: '全选',
    removeAllLabel: '取消全选',
    infoText: '人员 {0} 个',
    infoTextEmpty: '无',
    selectorMinimalHeight: 150,
    selectedListLabel: '已选',
    nonSelectedListLabel: '可选',
  };

  for (const k in options) {
    dual_params[k] = options[k];
  }

  $(options.ele).bootstrapDualListbox(dual_params);

  if (callFun) {
    callFun();
  }
}

/*
 * ace_file_input文件上传
 * @Param options:Object ace_file_input参数
 * @Param options.ele:String 页面元素
 * @Param options.type:String 文件类型
 * @Param options.size:Integer 文件大小
 * @Param callFun:Function 回调函数
 * 默认上传图片
 */
function getUpload(options, callFun) {
  const file_params = {
    style: 'well',
    btn_choose: `请上传小于${options.size}M的图片`,
    btn_change: null,
    no_icon: 'icon-picture',
    droppable: true,
    thumbnail: 'large',
    before_change(files, dropped) {
      if (files.length == 0) return false;
      const file = files[0];
      if (file == undefined) return false;

      let regx = new RegExp();
      let text = '';
      switch (options.type) {
        case ('doc'):
          regx = /\.(doc|docx|pdf|DOC|DOCX|PDF)$/;
          text = `请上传doc、docx、pdf格式的文档,大小不超过${options.size}M`;
          break;
        case ('xls'):
          regx = /\.(xls|xlsx|XLS|XLSX)$/;
          text = `请上传xls或xlsx格式的文件,大小不超过${options.size}M`;
          break;
        case ('video'):
          regx = /\.(mp4|ogg|webm|MP4|OGG|WEBM)$/;
          text = `请上传mp4、ogg、webm格式的视频,大小不超过${options.size}M`;
          break;
        default:
          regx = /\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/;
          text = `请上传gif、jpg、jpeg、png格式的图片,大小不超过${options.size}M`;
          break;
      }
      const suffix = file.name.substring(file.name.lastIndexOf('.'));
      if (!regx.test(suffix) || file.size > (options.size * 1024 * 1024)) {
        showGritter({ text });
        return false;
      }
      callFun(file);
      return true;
    },
    before_remove() {
      callFun(null);
      return true;
    },
  };

  for (const k in options) {
    file_params[k] = options[k];
  }

  $(options.ele).ace_file_input(file_params);
}


/*
 * daterange日期范围选择
 * @Param options:Object daterange参数
 * @Param options.ele:String 页面元素
 * @Param options.format:String 时间格式
 * @Param applyFun:Function 应用回调函数
 * @Param cancelFun:Function 取消回调函数
 */
function daterangePicker(options, applyFun, cancelFun) {
  const date_params = {
    startDate: moment().startOf('day'),
    endDate: moment().startOf('day'),
    showDropdowns: true,
    showWeekNumbers: true,
    autoUpdateInput: false,
    cancelClass: 'btn-grey',
    locale: {
      format: 'YYYY-MM-DD',
      separator: ' ~ ',
      applyLabel: "<i class='icon-ok'></i>应用",
      cancelLabel: "<i class='icon-remove'></i>取消",
      daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    },
  };

  if (!$.isEmptyObject(options)) {
    for (const k in options) {
      if (k == 'locale') {
        for (const subKey in options[k]) {
          date_params[k][subKey] = options[k][subKey];
        }
      } else {
        date_params[k] = options[k];
      }
    }
  }

  $(options.ele).daterangepicker(date_params)
    .on('apply.daterangepicker', function () {
      if (applyFun) {
        const value = $(this).val();
        applyFun(value);
      }
    })
    .on('cancel.daterangepicker', function (ev, picker) {
      picker.setStartDate(moment().startOf('day'));
      picker.setEndDate(moment().startOf('day'));
      $(this).val('');
      if (cancelFun) {
        cancelFun();
      }
    });
}

/*
 * 通过key查询目标数组value
 * @Param options:Object 用户参数
 * @Param options.data:Integer|String|Array 目标key的键值
 * @Param options.dataList:Array 目标数组
 * @Param options.key:String 目标数组key键名
 * @Param options.value:String 目标数组value键名
 * @Param options.symbol:String 针对data为数组时返回带标记的键值,默认为 ,
 * @Param callFun:Function 回调函数
 */
function getNameByKey(options, callFun) {
  let name = '';
  const { dataList } = options;
  const { data } = options;
  const { key } = options;
  const { value } = options;
  if ($.isArray(data)) {
    // 数组模式
    const nameList = [];
    data.forEach((item) => {
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i][key] == item) {
          nameList.push(dataList[i][value]);
          break;
        }
      }
    });
    const symbol = options.symbol ? options.symbol : ',';
    name = nameList.join(symbol);
  } else {
    for (let i = 0; i < dataList.length; i++) {
      if (dataList[i][key] == data) {
        name = dataList[i][value];
        break;
      }
    }
  }

  if (callFun) {
    callFun(name);
  }
  return name;
}
