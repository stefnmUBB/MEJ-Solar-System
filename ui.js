function resizeCanvas(){
	canvas.width  = $(window).width();
	canvas.height = $(window).height();
};

resizeCanvas();

window.onresize=function(){
	resizeCanvas();
};

function createOptions(sel,arr){
	var opt=document.createElement('option');
	opt.value=-1;
	opt.innerHTML="----";
	sel.appendChild(opt);
	for(i in arr) {
		var opt=document.createElement('option');
		opt.value=i;
		opt.innerHTML=arr[i].name;
		sel.appendChild(opt);
	}
}

$('#focus').change(function(){
	S.focus=$(this).val();	
	$(this).blur();
});

$('#speed').mousemove(function(){
	S.dt=$(this).val();
});

$('#speed').mouseup(function(){
	$(this).blur();
});

$('#active').change(function(){
	S.bodies[S.focus].active=!S.bodies[S.focus].active;
});

var cmx,cmy,cclicked=0;

$('#canvas').mousedown(function(e){
	cclicked=1;
	cmx=e.pageX-$(this).offset().left;
	cmy=e.pageY-$(this).offset().top;
});

$('#canvas').mousemove(function(e){
	if(!cclicked) return;
	S.focus=-1;
	$('#focus').val("-1");
	var nmx=e.pageX-$(this).offset().left;
	var nmy=e.pageY-$(this).offset().top;
	 S.scene.viewpoint=S.scene.viewpoint.add(new Vector2(cmx-nmx,cmy-nmy));
	cmx=nmx; cmy=nmy;
});

$('#canvas').mouseup(function(e){cclicked=0;});

$('#canvas').contextmenu(function(e){
	if(e.ctrlKey) return 0;
});

$('#canvas').click(function(e){
	switch(e.which) {
		case 1: { 
			if(e.ctrlKey) {S.scene.scale=S.scene.scale.mul(0.66);}
			if(e.altKey)  {S.scene.scale=S.scene.scale.mul(1.5); } 
			break;	
		}
	}
});


