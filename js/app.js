$(function() {
	//初始化标志
	var loaded_detial = false;
	// 登陆flag
	var logining = false;
	//检查本地缓存是否存在localstrong access token
	AddItems(1);
	// 加载flag
	var loading = false;
	//点赞flag
	var ups = false;
	//收藏flag
	var collecting = false;
	//初始化加载页码
	var pagenumber = 1;
	$(document).on('infinite', '.infinite-scroll-bottom', function() {
		//如果正在加载，则退出
		if(loading) return;
		// 设置flag
		loading = true;
		// 加载更多 
		pagenumber += 1;
		AddItems(pagenumber);
	});
	//主题详情页逻辑
	$(document).on("pageLoadStart", "#detial", function(e, pageId, $page) {
		$.showIndicator();
	});
	$(document).on("pageAnimationEnd", "#detial", function(e, pageId, $page) {
		if($(document.getElementById("contentbox")).hasClass("content-read")) {
			return
		}
		var id = GetQueryString("id") //获取ID
		GetTopicDetial(id);
	});
	$(document).on("pageInit", "#detial", function(e, pageId, $page) {
		if(!loaded_detial) {
			loaded_detial = true;
			console.log('初始化');
			$(document).on("click", ".markdown-text a", function(e) {
				var $target = $(e.currentTarget);
				if($target.attr("href").indexOf("/user/") == 0) {
					$.router.load("user.html?user=" + $(this).text().replace('@', ''));
				}
				return true
			});
			//登陆按钮
			$('.btn-login').on('click', function() {
				if(localStorage.token == 'undefined' && $('.token').val() == '') {
					$.toast("请输入accesstoken");
					return false;
				}
				$.showIndicator();
				Login($('.token').val());
			});
			//点赞按钮
			$(document).on("click", ".btn-up", function(e) {				
				if(sessionStorage.login) {
					//console.log($('.reply-content').val());
					if(ups) {
						return false
					}
					var el = $(this);
					Reply_Ups(el.data('id'), function(data) {
						var actionobj = {
							"up": function() {
								el.children().html(Number(el.children().html()) + 1);
								$.toast("点赞成功");
								console.log("点赞");
							},
							"down": function() {
								el.children().html(Number(el.children().html()) - 1);
								$.toast("取消点赞");
								console.log("取消点赞");
							}
						}
						if(data.action in actionobj) {
							actionobj[data.action]();
						}
					});
				} else {
					$.popup('.popup-login');
					$.toast("请先登陆");
				}
			});
			//收藏按钮
			$(document).on("click", ".btn-collect", function(e) {
				if(sessionStorage.login) {
					//console.log($('.reply-content').val());
					if(collecting) {
						return
					}
					if(!$(this).hasClass('collect')) {
						collecting = true;
						$(this).addClass('collect');
						Collect(sessionStorage.token, GetQueryString("id"));
					} else {
						collecting = true;
						$(this).removeClass('collect');
						DeCollect(sessionStorage.token, GetQueryString("id"));
					}
				} else {
					$.popup('.popup-login');
					$.toast("请先登陆");
				}
			});
			var w;
			//回复某人事件注册
			var reply = [];
			reply.type = "topic";
			$(document).on("click", ".btn-replyuser", function(e) {
				if(sessionStorage.login) {
					$.popup(".popup-reply");
					$('.reply-content').attr('placeholder', '@' + $(this).data('user') + ':');
					reply.type = "user";
					reply.id = $(this).data('id');
					reply.user = $(this).data('user');
				} else {
					$.popup('.popup-login');
					$.toast("请先登陆");
				}
			});
			//回复主题事件注册
			$(document).on("click", ".btn-replytopic", function(e) {
				if(sessionStorage.login) {
					$.popup(".popup-reply");
					$('.reply-content').attr('placeholder', '回复内容....');
					reply.type = "topic";
				} else {
					$.popup('.popup-login');
					$.toast("请先登陆");
				}
			});
			//回复按钮
			$('.btn-reply').on('click', function() {
				//console.log($('.reply-content').val());
				if(sessionStorage.login) {
					if($('.reply-content').val() == "") {
						$.toast("请输入回复内容");
						return
					} else {
						var replyobj = {
							"topic": function() {
								Reply($('.reply-content').val());
								console.log($('.reply-content').val());
							},
							"user": function() {
								ReplyUser($('.reply-content').val(), reply.id, reply.user);
								console.log($('.reply-content').val() + ' ' + reply.id + ' ' + reply.user);
							}
						}
						if(reply.type in replyobj) {
							replyobj[reply.type]();
						}

					}
				} else {
					$.popup('.popup-login');
					$.toast("请先登陆");
				}
				$('.reply-content').val('');
			});
		}
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
					if(e.canBack) {
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
	//主题列表页逻辑
	$(document).on("pageInit", "#index", function(e, pageId, $page) {
		BackIndex();
		//选项卡事件
		$('.bar-tab a').on('click', function(e) {
			if(sessionStorage.login) {
				window.location.href = $(this).attr('href');
			} else {
				$.toast("请先登陆");
				return false
			}
		});
		if(sessionStorage.login) {
			GetMessage_NoRead(sessionStorage.token, function(data) {
				var $badge = $(document.getElementById("bage-message"));
				data == 0 ? $badge.hide() : $badge.html(data).show();
			})
		}
		//发表按钮
		$('.btn-public').on('click', function() {
			sessionStorage.login ? $.popup('.popup-public') : $.toast("请先登陆");
		});
		//发表新主题按钮
		$('.btn-newtopic').on('click', function() {
			if(sessionStorage.login) {
				if(($('.topic-title').val() != '') && ($('.topic-tab').val() != '') && ($('.topic-content').val() != '')) {
					$.showPreloader('发表中');
				} else {
					$.toast("请填写完整");
					return false;
				}
				logining ? NewTopic(sessionStorage.token, $('.topic-title').val(), $('.topic-tav').val(), $('.topic-content').val()) : $.toast("请先登陆");
			}
		});
		//登陆按钮
		$('.btn-login').on('click', function() {
			if(localStorage.token == 'undefined' && $('.token').val() == '') {
				$.toast("请输入accesstoken");
				return false;
			}
			$.showIndicator();
			Login($('.token').val());
		});
		//侧边菜单
		$('.menu-message').on('click', function() {
			$.closePanel("#panel");
			$.router.load("message.html", true);
		});
		$('.menu-collect').on('click', function() {
			$.closePanel("#panel");
			$.router.load("collect.html", true);
		});
	});
	//主题列表页刷新逻辑
	// 添加'refresh'监听器
	$(document).on('refresh', '.pull-to-refresh-content', function(e) {
		console.log('开始刷新了页面');
		//模拟2S刷新
		setTimeout(function() {
			console.log('刷新结束');
			//重新设置标识 清除之前的数据
			$('.content-list').empty();
			pagenumber = 1;
			AddItems(pagenumber);
			//$.refreshScroller();
			// 加载完毕需要重置
			$.pullToRefreshDone('.pull-to-refresh-content');
		}, 2000)

	});
	//我的收藏逻辑
	$(document).on("pageInit", "#collect", function(e, pageId, $page) {
		if($(document.getElementById("content-box")).hasClass("content-read")) {
			return
		}
		GetCollect(sessionStorage.username);
	});
	//我的消息逻辑	
	$(document).on("pageInit", "#message", function(e, pageId, $page) {
		//首先获取未读消息数量
		GetMessage_NoRead(sessionStorage.token, function(data) {
				var $badge = $(document.getElementById("bage-message"));
				data == 0 ? $badge.hide() : $badge.html(data).show();
			})
			//获取消息列表

	});
	//用户详情页逻辑
	$(document).on("pageLoadStart", "#user", function(e, pageId, $page) {
		$.showIndicator();
	});
	$(document).on("pageAnimationEnd", "#user", function(e, pageId, $page) {
		if($(document.getElementById("content-box")).hasClass("content-read")) {
			return
		} else {
			var user = GetQueryString("user")
			UserAbout(user, function(data) {

			});
		}
	});
	$(document).on("pageInit", "#user", function(e, pageId, $page) {

	});
	$.init();
	//获取主题详情
	function GetTopicDetial(id) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {
				//			accesstoken:String;
				accesstoken: sessionStorage.token
			},
			url: 'https://cnodejs.org/api/v1/topic/' + id,
			success: function(data) {
				var login = sessionStorage.login;
				$('.detial-title').html(data.data.title);
				$('.content-box').append(
					[
						'<div class="card facebook-card" style="padding-bottom: 0.2rem;">' +
						'<div class="card-header no-border">' +
						'<div class="facebook-avatar"><img src="' + data.data.author.avatar_url + '" width="34" height="34"></div>' +
						'<div class="facebook-name fave btn-collect ' + (function() {
							return(data.data.is_collect ? 'collect' : '')
						})() + '" style="float: right;"></div>' +
						'<div class="facebook-name">' + data.data.author.loginname + '</div>' +
						'<div class="facebook-date">' + TranslateTime(data.data.create_at) + '</div>' +
						'</div>' +
						'<div class="card-content">' + data.data.content + '</div>' +
						'</div>'
					].join('')
				);
				$('.reply-all').html(data.data.reply_count);
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
							'</ul>' +
							'</div>' +
							'</div>' +
							'<div class="card-footer no-border">' +
							item.content +
							'</div>' +
							'<div class="card-footer">' +
							'<i class="iconfont icon-icontypraise btn-up" data-id="' + item.id + '" data-user="' + item.author.loginname + '">' +
							'<span class="reply-number">' +
							(function() {
								return(item.ups.length > 0 ? ' ' + item.ups.length : '')
							})() +
							'</span>' +
							'</i>' +
							'<i class="iconfont icon-pinglun btn-replyuser" data-id="' + item.id + '" data-user="' + item.author.loginname + '"></i>' +
							'</div>' +
							'</div>'
						].join('')
					);
				});
				//生成分享连接
				$.each($('.btn-menushare'),function(){
					$(this).attr('href','https://www.jiathis.com/send/?webid=' + $(this).attr('shareid') + '&url=http://cnodejs.applinzi.com/topic?id=' + id + '&title=' + data.data.title);
				})
				$('.reply-box').show();
				$.hideIndicator();
				$('.content-box').addClass('content-read');
			}
		})
	}
	//获取首页列表
	function AddItems(pagenumber) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {
				page: pagenumber
			},
			url: 'https://cnodejs.org/api/v1/topics',
			success: function(data) {
				//console.log(data.success);
				var tab = {
					"ask": "问答",
					"share": "分享",
					"job": "工作",
					"true": "精华"
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
							'<li>' + (tab[item.tab] || tab[item.good] || '无') + '</li>' +
							(function() {
								return(item.top ? '<li>置顶</li>' : '')
							})() +
							'</ul>' +
							'<a data-no-cache="true" href="detial.html?id=' + item.id + '">' +
							'<p>' + item.title + '</p>' +
							'</a>' +
							'<span class="user_name color-gray">' + item.author.loginname +
							'<img class="user_avatar pull-left" src="' + item.author.avatar_url + '">' +
							'</span>' +
							'<span class="color-gray pull-right user_time">最新回复&nbsp;' + TranslateTime(item.last_reply_at) + '</span>' +
							'</div>' +
							'</div>' +
							'</div>' + '</li>'
						].join('')
					);
				});
				loading = false;
			}
		})
	}
	//评论点赞
	function Reply_Ups(reply_id, callback) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: sessionStorage.token
			},
			url: 'https://cnodejs.org/api/v1/reply/' + reply_id + '/ups',
			success: function(data) {
				ups = false;
				callback(data);
			}
		})
	}
	//发表主题回复
	function Reply(reply_content) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: sessionStorage.token,
				content: reply_content
					//reply_id String 如果这个评论是对另一个评论的回复，请务必带上此字段。这样前端就可以构建出评论线索图。
			},
			url: 'https://cnodejs.org/api/v1/topic/' + GetQueryString("id") + '/replies',
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
				$.popup('.popup-reply');
			}
		})
	}
	//回复某人
	function ReplyUser(reply_content, id, user) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: sessionStorage.token,
				content: reply_content,
				reply_id: id //String 如果这个评论是对另一个评论的回复，请务必带上此字段。这样前端就可以构建出评论线索图。
			},
			url: 'https://cnodejs.org/api/v1/topic/' + GetQueryString("id") + '/replies',
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
						'</ul>' +
						'</div>' +
						'</div>' +
						'<div class="card-footer">' +
						'<div class="markdown-text">' +
						'<p>' +
						'<a href="/user/' + user + '">@' + user + '</a>' +
						reply_content +
						'</p>' +
						'</div>' +
						'</div>' +
						'</div>'
					].join('')
				);
				$.toast("回复成功");
				$.popup('.popup-reply');
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
			url: 'https://cnodejs.org/api/v1/accesstoken',
			success: function(data) {
				$('.panel-tips').empty();
				$('.row-loginbefore').hide();
				$('.row-loginafter').show();
				$('.panel-login-listdiv').show();
				$('.user_avatar_big').attr('src', data.avatar_url)
				$('.myname').text(data.loginname);
				$('.page-title').html('欢迎回来,' + data.loginname + '!');
				$.closeModal('.popup-login');
				//隐藏加载框
				$.hideIndicator();
				$.toast("成功登陆");
				logining = true;
				sessionStorage.token = token;
				sessionStorage.login = true;
				sessionStorage.username = data.loginname;
				sessionStorage.userimg = data.avatar_url;
				UserInfo(data.loginname, function(data) {
					sessionStorage.score = data.data.score;
					$('.myscore').text("积分" + sessionStorage.score);
				});
				GetMessage_NoRead(sessionStorage.token, function(data) {
						var $badge = $(document.getElementById("bage-message"));
						data == 0 ? $badge.hide() : $badge.html(data).show();
					})
					//sessionStorage.score = userinfo.score;

			},
			error: function() {
				//隐藏加载框
				$.hideIndicator();
				$.toast("accesstoken错误");
			}
		})
	}
	//新建主题
	function NewTopic(token, topic_title, topic_tab, topic_content) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: token,
				title: topic_title,
				tab: topic_tab,
				content: topic_content
			},
			url: 'https://cnodejs.org/api/v1/topics',
			success: function(data) {
				//隐藏加载框
				$.hidePreloader();
				$.toast("成功发表");
				$.closeModal('.popup-public');
			}
		})
	}
	//获取用户相关信息
	function UserAbout(name, callback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {

			},
			url: 'https://cnodejs.org/api/v1/topic_collect/' + name,
			success: function(data) {
				//返回信息
				if(data.data == '') {
					$('.content-slide-collect').append('<p style="text-align: center;">暂无数据</p>');
				} else {
					var tab = {
						"ask": "问答",
						"share": "分享",
						"job": "工作",
						"true": "精华"
					};
					$.each(data.data, function(index, item) {
						//console.log('item %d is: %s', index, item.title)
						//添加主题列表						
						$('.content-slide-collect').append(
							[
								'<li>' + '<div class="card">' +
								'<div class="card-content">' +
								'<div class="card-content-inner">' +
								'<ul class="label-ul">' +
								'<li>' + (tab[item.tab] || tab[item.good] || '无') + '</li>' +
								(function() {
									return(item.top ? '<li>置顶</li>' : '')
								})() +
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
				}
			}
		})
		UserInfo(name, function(data) {
			$('.user-info').html(data.data.loginname + '<br />积分:' + data.data.score);
			$('.user_avatar_big').attr('src', data.data.avatar_url);
			if(data.data.recent_topics == '') {
				$('.content-slide-lasttopics').append('<p style="text-align: center;">暂无数据</p>');
			} else {
				$.each(data.data.recent_topics, function(index, item) {
					//console.log('item %d is: %s', index, item.title)
					//添加主题列表						
					$('.content-slide-lasttopics').append(
						[
							'<li>' + '<div class="card">' +
							'<div class="card-content">' +
							'<div class="card-content-inner">' +
							'<a data-no-cache="true" href="detial.html?id=' + item.id + '">' +
							'<p>' + item.title + '</p>' +
							'</a>' +
							'<span class="user_name color-gray">' + item.author.loginname +
							'<img class="user_avatar pull-left" src="' + item.author.avatar_url + '">' +
							'</span>' +
							'<span class="color-gray pull-right user_time">最新回复&nbsp;' + TranslateTime(item.last_reply_at) + '</span>' +
							'</div>' +
							'</div>' +
							'</div>' + '</li>'
						].join('')
					);
				});
			}
			if(data.data.recent_replies == '') {
				$('.content-slide-lastreplies').append('<p style="text-align: center;">暂无数据</p>');
			} else {
				$.each(data.data.recent_replies, function(index, item) {
					//console.log('item %d is: %s', index, item.title)
					//添加主题列表						
					$('.content-slide-lastreplies').append(
						[
							'<li>' + '<div class="card">' +
							'<div class="card-content">' +
							'<div class="card-content-inner">' +
							'<a data-no-cache="true" href="detial.html?id=' + item.id + '">' +
							'<p>' + item.title + '</p>' +
							'</a>' +
							'<span class="user_name color-gray">' + item.author.loginname +
							'<img class="user_avatar pull-left" src="' + item.author.avatar_url + '">' +
							'</span>' +
							'<span class="color-gray pull-right user_time">最新回复&nbsp;' + TranslateTime(item.last_reply_at) + '</span>' +
							'</div>' +
							'</div>' +
							'</div>' + '</li>'
						].join('')
					);
				});
			}
			//隐藏加载框
			$.hideIndicator();
		});
		$(document.getElementById("content-box")).addClass('content-read');
		callback();
		console.log('wanc ');
	}
	//获取用户信息
	function UserInfo(name, callback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {

			},
			url: 'https://cnodejs.org/api/v1/user/' + name,
			success: function(data) {
				//返回信息
				callback(data);
			}
		})
	}
	//获取收藏
	function GetCollect(username) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {

			},
			url: 'https://cnodejs.org/api/v1/topic_collect/' + username,
			success: function(data) {
				var tab = {
					"ask": "问答",
					"share": "分享",
					"job": "工作",
					"true": "精华"
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
							'<li>' + (tab[item.tab] || tab[item.good] || '无') + '</li>' +
							(function() {
								return(item.top ? '<li>置顶</li>' : '')
							})() +
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
				$(document.getElementById("content-box")).addClass('content-read');
			}
		})
	}
	//收藏主题
	function Collect(token, id) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: token,
				topic_id: id
			},
			url: 'https://cnodejs.org/api/v1/topic_collect/collect',
			success: function(data) {
				$.toast("收藏成功");
				collecting = false;
			}
		})
	}
	//取消主题
	function DeCollect(token, id) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: token,
				topic_id: id
			},
			url: 'https://cnodejs.org/api/v1/topic_collect/de_collect',
			success: function(data) {
				$.toast("取消收藏");
				collecting = false;
			}
		})
	}
	//获取未读消息数
	function GetMessage_NoRead(token, callback) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {
				accesstoken: token
			},
			url: 'https://cnodejs.org/api/v1/message/count',
			success: function(data) {
				callback(data.data);
			}
		})
	}
	//获取已读和未读消息
	function GetMessage(token) {
		$.ajax({
			type: 'get',
			dataType: 'json',
			data: {
				accesstoken: token
			},
			url: 'https://cnodejs.org/api/v1/messages',
			success: function(data) {

			}
		})
	}
	//标记全部已读
	function Message_Mark(token) {
		$.ajax({
			type: 'post',
			dataType: 'json',
			data: {
				accesstoken: token
			},
			url: 'https://cnodejs.org/api/v1/messages',
			success: function(data) {

			}
		})
	}
	//返回首页加载已缓存资源
	function BackIndex() {
		if(sessionStorage.login) {
			$('.panel-tips').empty();
			$('.row-loginbefore').hide();
			$('.row-loginafter').show();
			$('.panel-login-listdiv').show();
			$('.user_avatar_big').attr('src', sessionStorage.userimg);
			$('.myname').text(sessionStorage.username);
			$('.myscore').text("积分" + sessionStorage.score);
			$('.page-title').html('欢迎回来,' + sessionStorage.username + '!');
		}
	}
	//获取浏览器参数
	function GetQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	}
	//转换时间标识
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
		if(diffValue < 0) {
			//若日期不符则弹出窗口告之
			//alert("结束日期不能小于开始日期！");
		}
		var monthC = diffValue / month;
		var weekC = diffValue / (7 * day);
		var dayC = diffValue / day;
		var hourC = diffValue / hour;
		var minC = diffValue / minute;
		if(monthC >= 1) {
			result = parseInt(monthC) + "个月前";
		} else if(weekC >= 1) {
			result = parseInt(weekC) + "周前";
		} else if(dayC >= 1) {
			result = parseInt(dayC) + "天前";
		} else if(hourC >= 1) {
			result = parseInt(hourC) + "个小时前";
		} else if(minC >= 1) {
			result = parseInt(minC) + "分钟前";
		} else
			result = "刚刚发表";
		return result;
	}
});
