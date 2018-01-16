function renderOnHref(){
	$("a[href^='#'][href!='#']").click(function() {
	  var target = document.getElementById(this.hash.slice(1));
	  if (!target) return;
	  var targetOffset = $(target).offset().top-90;
	  $('html,body').animate({scrollTop: targetOffset}, 400);
	  return false;
	});
}


function getTreeData(){
	$.ajax({
       type: "get",
		dataType: 'jsonp',
		jsonp:'jsonpcallback',
		async:false,
		data:{},
       url: 'http://localhost:8080/tree/queryAll',
       success: function (data) {
    	   var treeStr = JSON.stringify(data);
    	   treeStr = treeStr.replace(/\[\]/g,"\"\"");
    	   var tree = [
    		   JSON.parse(treeStr)
    		];
    	   $('#leftTree').treeview({
    		   data:tree,
    		   onNodeSelected:function(event,data){
    			   getKnowledge(data.knowledgeId);
    		   }
    	   });
       }
   });
}
getTreeData();

function getKnowledge(knowledgeId){
	$.ajax({
       type: "get",
		dataType: 'jsonp',
		jsonp:'jsonpcallback',
		async:false,
		data:{},
       url: 'http://localhost:8080/knowledge/queryKnowledge/' + knowledgeId,
       success: function (result) {
    	   var navigationArray = renderContent(result.data);
    	   renderNavigation(navigationArray);
    	   renderOnHref();
       }
   });
}

//渲染知识内容，返回导航数组，数组内是MAP
function renderContent(data){
	var knowledge = data.coreKnowledge;
	$('#titleId').html(knowledge.konwledgeTitle);
	$('#contentMain').html("");
	var main = $('#contentMain');
	var navigationArray = new Array();
	var pointList =  data.knowledgePointVoList;
	for(var pointIndex in pointList){
		var pointObj = pointList[pointIndex];
		var point = pointObj.coreKnowledgePoint;
		var h2 = $('<h2></h2>').attr("id",point.knowledgeCode + point.pointId).text(point.pointName);
		var navigationMap = new Map();
		navigationMap.put(point.knowledgeCode + point.pointId,point.pointName);
		navigationArray[pointIndex] = navigationMap;
		var hr = $('<hr />');
		main.append(h2,hr);
		var partList = pointObj.coreKnowledgePointPartVoList;
		for(var partIndex in partList){
			var partObj = partList[partIndex];
			var part = partObj.coreKnowledgePointPart;
			var h3 = $('<h3></h3>').html(part.partName);
			main.append(h3);
			if(part.partShowType == "01"){
				var textContent = partObj.coreKnowledgeTextContent;
				var p = $("<p></p>").html(textContent.textContent);
				main.append(p);
			}else if(part.partShowType == "02"){
				var listContentList = partObj.coreKnowledgeListContentList;
				if(listContentList.length > 0){
					var dl = $("<dl></dl>").addClass("dl-horizontal");
					for(var listIndex in listContentList){
						var listContent = listContentList[listIndex];
						var dt = $('<dt></dt>').text(listContent.listContentName + " :");
						var dd = $('<dd></dd>').html(listContent.listContent);
						dl.append(dt,dd);
					}
					main.append(dl);
				}
			}else if(part.partShowType == "03"){
				var imageContentList = partObj.coreKnowledgeImageContentList;
				if(imageContentList.length > 0){
					var p = $("<p></p>").html();
					for(var imageIndex in imageContentList){
						var imageContent = imageContentList[imageIndex];
						var p = $("<p></p>").html(imageContent.imageContent);
						var img = $('<img />').attr("src",imageContent.imagePath + imageContent.imageFile).addClass("img-rounded img-responsive center-block");
						var bottomP = $('<p></p>').text(imageContent.imageTitle).addClass("text-center");
						main.append(p,img,bottomP);
					}
				}
			}
		}
	}
	return navigationArray;
}

function renderNavigation(navigationArray){
	$("#rightNavigationId").html("");
	var naviga = $("#rightNavigationId");
	var h4 = $("<h4></h4>").text("快速导航");
	naviga.append(h4);
	var ol = $("<ol></ol>").addClass("list-unstyled");
	for(var navigationIndex in navigationArray){
		var navigationMap = navigationArray[navigationIndex];
		for(var structIndex in navigationMap.arr){
			var struct = navigationMap.arr[structIndex];
			var a = $("<a></a>").attr("href","#" + struct.key).text(struct.value);
			var li = $("<li></li>");
			li.append(a);
			ol.append(li);
		}
		naviga.append(ol);
	}
}

function link(linkButton){
	var linkButtonJqueryObj = $(linkButton);
	$.ajax({
	       type: "get",
			dataType: 'jsonp',
			jsonp:'jsonpcallback',
			async:false,
			data:{},
	       url: 'http://localhost:8080/knowledge/queryLinkKnowledge/' + linkButtonJqueryObj.attr("data-link"),
	       success: function (result) {
	    	   var navigationArray = renderContent(result.data);
	    	   renderNavigation(navigationArray);
	    	   renderOnHref();
	       }
	   });
}

