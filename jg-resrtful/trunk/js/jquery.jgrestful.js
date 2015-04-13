/**
 *
 * jg-restful
 *
 * Licensed  Apache Licence 2.0
 * 
 * Version : 1.0.0
 *
 * Author JiGang 2015-1-30
 *
 *  /a/{a}/a.html
 *  /a/{a,b,c}/a.html
 *	/a/{a=:a,b=:b,c=:c}/a.html
 *	/a/{0}/a.html
 *
 *  /a/[a]/a.html
 *  /a/[a,b,c]/a.html
 *	/a/[a=:a,b=:b,c=:c]/a.html
 *	/a/[0]/a.html
 *
*/
(function($){
var _ajax = $.ajax;
$.ajax = function(options){
	var r		 = restful(options.url,options.data,options.type);
	options.url  = r.url;
	options.data = r.data;
	return _ajax(options);
}
//去掉带问号的连接?
function fixUrl(url){
	if(!url){
		return "";
	}
	var index = url.indexOf("?");
	if(index>0){
		url = url.substring(0,index);
	}
	return url;
}
//获取Url参数
function getUrlParams(url){
	var data  = [];
	var index = url.indexOf("?");
	if(index>0){
		url = url.substring(index+1,url.length);
	}else{
		return data;
	}
	var pstrs = url.split("&");
	for(var i=0;i<pstrs.length;i++){
		var pv = pstrs[i].split("=");
		if(pv.length!=2){
			continue;
		}
		data.push({"name":pv[0],"value":pv[1]});
	}
	return data;
	
}

function restful(url,data,type){
	//如果data为string格式，不做处理
	if(typeof data==="string"){
		return {url:url,data:data};
	}
	var udata	= [];
	//post 去掉URL中的参数，放入data中
	if(type==="post"){
		udata	= getUrlParams(url);
		url		= fixUrl(url);
	}
	
	if(!data){
		data = [];
	}else if(!$.isArray(data)){
		data = serializeArrayObject(data);
	}
	//合并URL中的参数
	data = $.merge($.merge([],data), udata);
	
	//console.log(url);
	var rules = [];
	//console.log("B:  "+url);
	url.replace(/\{[\w=:,]+\}|\[[\w=:,]+\]/g,function(s,v){
		rules.push(new Rule(s));
	});

	//console.log(url);
	if(data.length>0&&rules.length>0){
		for(var i=0;i<rules.length;i++){
			for(var k=0;k<data.length;k++){
				rules[i].parse(data[k].name,data[k].value,k);
			}
		}
	}
	var i = 0;
	url = url.replace(/\{[\w=:,]+\}|\[[\w=:,]+\]/g,function(s,v){
		return rules[i++].toString();
	});
	//console.log("A:  "+url);
	if(!type||type==="get"){
		//data = [];
	}
	return {url:url,data:data};
}

function serializeArrayObject(obj){
		var data =[];
		$.each(obj,function(i,v){
			 	if($.isArray(v)){
					$.each(v,function(ii,vv){
							data.push({name:i,value:vv});
					});
				}else{
					data.push({name:i,value:v});
				}
		});
		return data;
}

function Rule(path){
	 this.params = [];
	 this.values = [];
	 this.single = true;
	 if(path.charAt(0)=="["){
		this.single = false;
	 }
	 path = path.substring(1,path.length-1);
	 var ps = path.split(",");
	 for(var i=0;i<ps.length;i++){
		 var p = ps[i];
		 if(new RegExp(/\d+/g).test(p)){
			this.params.push({index:parseInt(p)});
		 }else if(new RegExp(/^[a-zA-Z]+$/g).test(p)){
			this.params.push({name:p});
		 }else if(new RegExp(/^[a-zA-Z]+=:[a-zA-Z]+$/g).test(p)){
			var pns = p.split("=:");
			this.params.push({vname:pns[0],name:pns[1]});
		 }else if(new RegExp(/^[a-zA-Z]+=:\d+$/g).test(p)){
			var pns = p.split("=:");
			this.params.push({vname:pns[0],index:parseInt(pns[1])});
		 }
	 }
	 
	 
}
Rule.prototype.toString = function(){
	var value = "";
	for(var i=0; i<this.values.length; i++){
		value += this.values[i]+",";
	}
	return this.values.length>0?value.substring(0,value.length-1):"null";
}
Rule.prototype.parse = function(name,value,index){
	for(var i=0;i<this.params.length;i++){
		if(this.params[i].name===name||this.params[i].index===index){
			var rvalue = "";
			if(this.params[i].vname){
				rvalue = this.params[i].vname +"="+value; 
			}else{
				rvalue = value; 
			}
			if(this.single){
				this.values[0] = rvalue;
			}else{
				this.values.push(rvalue);
			}
		}
	}
}

})(jQuery);