$(function() {
	//收藏页面逻辑
	$(document).on("pageInit", "#collect", function(e, pageId, $page) {
		if (sessionStorage.login) {
			$('.panel-tips').empty();
			$('.row-loginbefore').hide();
			$('.row-loginafter').show();
			$('.user_avatar_big').attr('src', sessionStorage.userimg);
			$('.myname').text(sessionStorage.username);
			$('.myscore').text("积分" + sessionStorage.score);
			if (!($('.card').length>=1)){
				GetCollect(sessionStorage.username);
			}					
		}
	});
	//收藏下详情页逻辑
	$(document).on("pageLoadStart", "#detial", function(e, pageId, $page) {
		$.showIndicator();
	});
	$(document).on("pageAnimationEnd", "#detial", function(e, pageId, $page) {
		if ($(document.getElementById("contentbox")).hasClass("content-read")) {
			return
		}
		var id = GetQueryString("id") //获取ID
		GetTopicDetial(id);
	});
	$(document).on("pageInit", "#detial", function(e, pageId, $page) {
		$(document).on("click", ".markdown-text a", function(e) {
			var $target = $(e.currentTarget);
			if ($target.attr("href").indexOf("/user/") == 0) {
				$.router.load("user.html?user=" + $(this).text());
			}
			return true
		});
		var w;
		//回复按钮
		$('.btn-reply').on('click', function() {
			//console.log($('.reply-content').val());
			if (sessionStorage.login) {
				Reply($('.reply-content').val());
			} else {
				$.popup('.popup-login');
				$.toast("请先登陆");
			}
			$('.reply-content').val('');
		});
		document.addEventListener('plusready', function() {
			$(document).on("click", ".markdown-text a", function(e) {
				var $target = $(e.currentTarget);
				w = plus.webview.open($target.attr("href"), "webview", {
					top: "42px",
					bottom: "0px"
				}, "slide-in-rigth");
				w.addEventListener("error", function(e) {
					w.close();
					alert('加载错误');
				}, false);
				$('.bar-app').hide();
				$('.bar-webview').show();
			});
			$('.webview-back').on('click', function() {
				var w_bind = plus.webview.getWebviewById("webview");
				w_bind.canBack(function(e) {
					if (e.canBack) {
						w_bind.close();
					}
					//				else{
					//					w.close();
					//					//替换顶部header
					//					$('.bar-app').show();
					//					$('.bar-webview').hide();
					//				}
				});
			});
			$('.webview-close').on('click', function() {
				var w_bind = plus.webview.getWebviewById("webview");
				w_bind.close();
				//替换顶部header
				$('.bar-app').show();
				$('.bar-webview').hide();
			});
		});
	});
	$.init();
	//获取收藏
	function GetCollect(username) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {

			},
			url: 'http://cnodejs.org/api/v1/topic_collect/' + username,
			success: function(data) {
				var tab = {
					"ask": "问答",
					"share": "分享",
					"job": "工作",
					"true": "精华",
					"top":'<li>1</li>'
				};
				$.each(data.data, function(index, item) {
					//console.log('item %d is: %s', index, item.title)
					//添加主题列表						
					$('.content-list').append(
						[
							'<li>' + '<div class="card">' +
							'<div class="card-content">' +
							'<div class="card-content-inner">' +
							'<ul class="label-ul">' +
							'<li>' + (tab[item.tab] || '无') + '</li>' +
							'</ul>' +
							'<a href="detial.html?id=' + item.id + '">' +
							'<p>' + item.title + '</p>' +
							'</a>' +							
							'</div>' +
							'</div>' +
							'</div>' + '</li>'
						].join('')
					);
				});
				sessionStorage.collect = true;
				
			}
		})
	}
	//发表回复
	function Reply(reply_content) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: sessionStorage.token,
				content: reply_content
					//reply_id String 如果这个评论是对另一个评论的回复，请务必带上此字段。这样前端就可以构建出评论线索图。
			},
			url: 'http://cnodejs.org/api/v1/topic/' + GetQueryString("id") + '/replies',
			success: function(data) {
				$('.content-list').append(
					[
						'<div class="card">' +
						'<div class="card-content">' +
						'<div class="list-block media-list">' +
						'<ul>' +
						'<li class="item-content">' +
						' <div class="item-media">' +
						'<img class="user_avatar" src="' + sessionStorage.userimg + '">' +
						'</div>' +
						'<div class="item-inner">' +
						'<div class="item-title-row">' +
						'<div class="item-title">' + sessionStorage.username + '</div>' +
						'<div class="item-time color-gray">' + '刚刚发表' + '</div>' +
						'</div>' +
						'</li>' +
						//			          	'<li class="item-content">'+
						//						'<a href="./detial/?id=' + item.id + '">' +
						//						'<p>' + item.content + '</p>' +
						//						'</a>' +
						//						'</li>'+
						'</ul>' +
						'</div>' +
						'</div>' +
						'<div class="card-footer">' +
						reply_content +
						'</div>' +
						'</div>'
					].join('')
				);
				$.toast("回复成功");

			}
		})
	}
	//登陆
	function Login(token) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: token
			},
			url: 'http://cnodejs.org/api/v1/accesstoken',
			success: function(data) {
				$('.panel-login').append(
					[
						'<div class="list-block panel-login-listdiv">' +
						'<ul>' +
						'<li class="item-content">' +
						'<div class="item-media"><i class="icon icon-f7"></i></div>' +
						'<div class="item-inner">' +
						'<div class="item-title">用户名</div>' +
						'<div class="item-after">' + data.loginname + '</div>' +
						'</div>' +
						'</li>' +
						'</ul>' +
						'</div>'
					].join('')
				);
				$('.panel-tips').empty();
				$('.user_avatar_big').attr('src', data.avatar_url)
				$('.page-title').html('欢迎回来,' + data.loginname + '!');
				//隐藏加载框
				$.hidePreloader();
				$.toast("成功登陆");
				logining = true;
				sessionStorage.token = token;
				sessionStorage.login = true;
				sessionStorage.username = data.loginname;
				sessionStorage.userimg = data.avatar_url;
				$.closeModal('.popup-login');
			},
			error: function() {
				//隐藏加载框
				$.hidePreloader();
				$.toast("accesstoken错误");
			}
		})
	}
	//获取主题详情
	function GetTopicDetial(id) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {
				//			accesstoken:String;
			},
			url: 'http://cnodejs.org/api/v1/topic/' + id,
			success: function(data) {
				$('.title').html(data.data.title);
				$('.content-box').append(
					[
						'<div class="card facebook-card">' +
						'<div class="card-header no-border">' +
						'<div class="facebook-avatar"><img src="' + data.data.author.avatar_url + '" width="34" height="34"></div>' +
						'<div class="facebook-name">' + data.data.author.loginname + '</div>' +
						'<div class="facebook-date">' + TranslateTime(data.data.create_at) + '</div>' +
						'</div>' +
						'<div class="card-content">' + data.data.content + '</div>' +
						'<div class="card-footer no-border">' +
						'<a href="#" class="link">赞</a>' +
						'<a href="#" class="link">评论</a>' +
						'</div>' +
						'</div>'
					].join('')
				);
				$.each(data.data.replies, function(index, item) {
					//添加主题回复
					//console.log(item);
					$('.content-list').append(
						[
							'<div class="card">' +
							'<div class="card-content">' +
							'<div class="list-block media-list">' +
							'<ul>' +
							'<li class="item-content">' +
							' <div class="item-media">' +
							'<img class="user_avatar" src="' + item.author.avatar_url + '">' +
							'</div>' +
							'<div class="item-inner">' +
							'<div class="item-title-row">' +
							'<div class="item-title">' + item.author.loginname + '</div>' +
							'<div class="item-time color-gray">' + TranslateTime(item.create_at) + '</div>' +
							'</div>' +
							'</li>' +
							//			          	'<li class="item-content">'+
							//						'<a href="./detial/?id=' + item.id + '">' +
							//						'<p>' + item.content + '</p>' +
							//						'</a>' +
							//						'</li>'+
							'</ul>' +
							'</div>' +
							'</div>' +
							'<div class="card-footer">' +
							item.content +
							'</div>' +
							'</div>'
						].join('')
					);
				});
				$('.reply-box').show();
				$('.content-box').addClass('content-read');
			}
		})
	}
	function GetQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}
	function TranslateTime(time) {
		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;
		var halfamonth = day * 15;
		var month = day * 30;
		var date = time.substring(0, 19);
		date = date.replace(/-/g, '/').replace(/T/g, ' ').replace(/Z/g, ' '); //转换得到的时间
		var timestamp1 = new Date(date).getTime() + 28800000; //       
		var now = new Date(); // 
		var diffValue = now - timestamp1;
		if (diffValue < 0) {
			//若日期不符则弹出窗口告之
			//alert("结束日期不能小于开始日期！");
		}
		var monthC = diffValue / month;
		var weekC = diffValue / (7 * day);
		var dayC = diffValue / day;
		var hourC = diffValue / hour;
		var minC = diffValue / minute;
		if (monthC >= 1) {
			result = parseInt(monthC) + "个月前";
		} else if (weekC >= 1) {
			result = parseInt(weekC) + "周前";
		} else if (dayC >= 1) {
			result = parseInt(dayC) + "天前";
		} else if (hourC >= 1) {
			result = parseInt(hourC) + "个小时前";
		} else if (minC >= 1) {
			result = parseInt(minC) + "分钟前";
		} else
			result = "刚刚发表";
		return result;
	}
})