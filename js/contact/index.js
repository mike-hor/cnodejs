$(function() {
	// 获取浏览器窗口的可视区域的高度
	function getViewPortHeight() {
		return document.documentElement.clientHeight || document.body.clientHeight;
	};
	//定义一个检测发送失败的函数
	var timer;
	$('.swiper-container').css('height', parseInt(getViewPortHeight() - 215) + 'px');
	var swiper = new Swiper('.swiper-container', {
		direction: 'vertical',
		slidesPerView: 'auto',
		mousewheelControl: true,
		freeMode: true
	});
	$('.pravite_chat_content').on('click', '.pravite_chat_content_music_playbtn', function() { //需使用冒泡事件
		var src = $(this).data("musicsrc");
		$("#audio").attr('src', src);
		var audio = $("#audio")[0];
		audio.play();
		$(this).removeClass('pravite_chat_content_music_new');
	});
	//        if (/Firefox\/\s/.test(navigator.userAgent)){
	//     var socket = io.connect('http://gamechat.applinzi.com',{transports:['xhr-polling']}); 
	// } 
	// else if (/MSIE (\d+.\d+);/.test(navigator.userAgent)){
	//     var socket = io.connect('http://gamechat.applinzi.com',{transports:['jsonp-polling']}); 
	// } 
	// else { 
	//    var socket = io.connect('http://gamechat.applinzi.com' , {transports: ["websocket"]}); 
	// }
	// var socket = io.connect('http://localhost:5050' , {transports: ["websocket"]}); 
	var socket = io.connect('http://chatnode.applinzi.com');
	var userid = getUid();
	socket.time = function() {
		var myDate = new Date();
		var time = myDate.getHours() + ':' + myDate.getMinutes();
		return time;
	}
	socket.emit('login', {
		userid: userid,
		username: sessionStorage.username,
		userimg: sessionStorage.userimg
	});
	//console.log('您已加入聊天室，您的ID为' + userid);
	$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">连接成功，您已加入聊天室</span></li>');
	socket.on("login", function(data) {
		if (data.userid != userid) {
			$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">欢迎' + data.username + '加入聊天室</span></li>');
		} else {
			//自己登陆不显示消息
		}
	});
	socket.on("pravite", function(data) {
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">您的socketID:' + data.id + '</span></li>');
		swiper.update();
	});
	socket.on("message", function(data) {

		if (data.userid == userid) {
			//自己说的话不显示消息  但是可以知道发送的消息成功了没有
			clearTimeout(timer); //如果经过15秒还没有接收到自己的消息则判断为消息发送失败
			$('.pravite_chat_box_input').val(''); //清楚掉刚刚发送的信息              
		} else {
			console.log(socket.time());
			swiper.update();
			$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">' + socket.time() + '</span></li><li><div class="pravite_chat_content_receive_box" style=""><img src="' + data.userimg + '" class="pravite_chat_content_userimg_receive"><div data-tag="1450237884" class="pravite_chat_content_receive chat_box"><p>' + data.username + '说:' + replace_em(data.content) + '</p></div></div></li>');
		}
	});
	socket.on("disconnect", function() {
		console.log("服务器端断开连接.");
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">您与服务器断开了连接请刷新页面</span></li>');
		swiper.update();
	});
	socket.on("logout", function(data) {
		//console.log(data.userid+'退出了聊天室'+'     当前剩余总人数:'+data.onlineCount); 
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">' + data.username + '退出了聊天室' + ' 当前剩余总人数:' + data.onlineCount + '</span></li>');
		swiper.update();
	});
	//提示游戏准备
	socket.on("gameredy", function(data) {
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">还有一分钟游戏就要开始了</span></li>');
		swiper.update();
	});
	//开始游戏显示游戏相关提示
	socket.on("gamestart", function(data) {
		if (data.gamestate) {
			var tips = '';
			if (data.gametype == 'picture') {
				tips = '图片猜猜猜';
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">开始游戏了' + ' 当前游戏类型:' + tips + '</span></li>');
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time"><img src="' + data.gamequestion + '"alt=""><br/>' + data.gameinfo + '</span></li>');
				swiper.update();
			} else if (data.gametype == 'music') {
				tips = '音乐小王子';
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">开始游戏了' + ' 当前游戏类型:' + tips + '</span></li>');
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time"><span class = "pravite_chat_content_music_playbtn pravite_chat_content_music_new" data-musicsrc="' + data.gamequestion + '"></span><br/>' + data.gameinfo + '</span></li>');
				swiper.update();
			} else if (data.gametype == 'word') {
				tips = '我是对穿肠';
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">开始游戏了' + ' 当前游戏类型:' + tips + '</span></li>');
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">游戏问题:' + data.gamequestion + ' (请在见到问题后再聊天框中直接输入答案并发送)</span></li>');
				swiper.update();
			} else {
				swiper.update();
				return;
			};
		};
	});
	//游戏获胜者
	socket.on("gamewiner", function(data) {
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">恭喜id为' + data.gamewiner + ' 在本次游戏中获胜并获得1积分</span></li>');
		swiper.update();
	});
	socket.on("gameover", function(data) {
		$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">这问题有那么难吗？居然没人回答出来</span></li>');
		swiper.update();
	});
	// socket.emit('message', {userid:userid,content:"我是内容"});
	function getUid() {
		return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
	}
	$('.com_form_send_btn').click(function() {
		var content = $('.pravite_chat_box_input').val();
		if ($('.pravite_chat_box_input').val() == '') {
			console.log('请输入内容');
		} else {
			socket.emit('message', {
				userid: userid,
				username: sessionStorage.username,
				userimg: sessionStorage.userimg,
				content: content
			});
			console.log(socket.time());
			$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">' + socket.time() + '</span></li><li><div class="pravite_chat_content_send_box"><div data-tag="1449553677" class="pravite_chat_content_send chat_box"><p>' + sessionStorage.username + '说:' + replace_em(content) + '</p></div><img src="' + sessionStorage.userimg + '" class="pravite_chat_content_userimg_send"></div></div></li>');
			swiper.update();
			timer = setTimeout(function() {
				$('.pravite_chat_content  ul').prepend('<li class="tips"><span class="pravite_chat_content_time">您的消息发送失败，请重新发送</span></li>');
			}, 10000);
		}
	});
	//表情盒子初始化
	$('.emotion').qqFace({
		id: 'facebox', //表情盒子的ID
		assign: 'saytext', //给那个控件赋值
		path: 'css/contact/face/' //表情存放的路径
	});
	//表情的转换
	function replace_em(str) {
		str = str.replace(/\</g, '&lt;');
		str = str.replace(/\>/g, '&gt;');
		str = str.replace(/\n/g, '<br/>');
		str = str.replace(/\[em_([0-9]*)\]/g, '<img src="css/contact/face/$1.gif" border="0" />');
		return str;
	}
})