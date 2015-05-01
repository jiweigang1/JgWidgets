(function(){

	var getRandomColor = function(){
		return '0x'+Math.floor(Math.random()*16777215).toString(16);
	}

	


  JgPmap = function(game,mapdata){
	Phaser.Group.call(this,game,null,"JgPmap",true);
	this._background1 = new Phaser.Graphics(game,0,0);
	this._background1.beginFill(0xFFFFFF);
	this._background1.moveTo(0,0).lineTo(0,50000).lineTo(50000,50000).lineTo(50000,0);
	this._background1.endFill();
	this.add(this._background1);
	this._createMap(mapdata);
	
	this._toolTip = new ToolTip(game);
	this.add(this._toolTip);
	
  };
  
  JgPmap.prototype = Object.create(Phaser.Group.prototype);
  JgPmap.prototype.constructor = JgPmap;
  JgPmap.prototype._createMap = function(mapdata){
	var self = this;
	for(var path in mapdata.paths){
		var area = new Area(this.game,{name:mapdata.paths[path].name},mapdata.paths[path].path);
			area.setColor(getRandomColor());
			area.onMouseOver = function(location){
				self._toolTip.setName(location.name);
			}
			area.onMouseOut = function(location){
				self._toolTip.setName("");
			}
		this.add(area);
	}
  }
  
  
  function Area(game,location,pathString){
	Phaser.Group.call(this,game,null,"Area",true);
	this._pathString = pathString;
	this._location	 = location;
	this._gs		 = [];
	this._create();
  }
  Area.prototype = Object.create(Phaser.Group.prototype);
  Area.prototype.constructor = Area;
  
  Area.prototype._create	= function(){
	var self  = this;
	var data  = this._parsePath(this._pathString);	
	var paths =[[]];
	for(var i=0;i<data.length;i++){
		if(data[i][0]=="z"){
			paths.push([]);
			continue;
		}
		paths[paths.length-1].push(data[i]);
	}
	
	
	var c = getRandomColor();
	for(var k=0;k<paths.length;k++){
		var graphics = new Phaser.Graphics(this.game,0,0);
			graphics.beginFill(0xFFFFFF);
			var data = paths[k];
			for(var i=0;i<data.length;i++){
				
				if(data[i][0]=="M"||data[i][0]=="m"){
					graphics.moveTo(data[i][1],data[i][2]);
				}else if(data[i][0]=="l"){
					graphics.lineTo(data[i][1],data[i][2]);
				}
				
			}
			graphics.endFill();
			var ps = [];
			for(var i=0;i<data.length;i++){
				ps.push(new Phaser.Point(data[i][1], data[i][2]));
			}
			graphics.hitArea = new Phaser.Polygon(ps);
			graphics.inputEnabled = true;
			graphics.events.onInputOver.add(function(){
				if(self.onMouseOver){
					self.onMouseOver.call(this,this._location);
				}
			},this);
			graphics.events.onInputOut.add(function(){
				if(self.onMouseOut){
					self.onMouseOut.call(this,this._location);
				}
			},this);
			this.add(graphics);
			this._gs.push(graphics);
	}
  }
  
  Area.prototype.setColor = function(color){
	for(var i=0;i<this._gs.length;i++){
		if(this._gs[i].graphicsData[0]){
			this._gs[i].graphicsData[0].fillColor = color;
		}
		
	}
  }
  
  Area.prototype._parsePath	= function(path){
	var length = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
	var segment = /([astvzqmhlc])([^astvzqmhlc]*)/ig	;
	
	function parseValues(args){
		args = args.match(/-?[.0-9]+(?:e[-+]?\d+)?/ig)
		return args ? args.map(Number) : [];
	}
	
	
	var data = []
	path.replace(segment, function(_, command, args){
		var type = command.toLowerCase()
		args = parseValues(args)

		// overloaded moveTo
		if (type == 'm' && args.length > 2) {
			data.push([command].concat(args.splice(0, 2)))
			type = 'l'
			command = command == 'm' ? 'l' : 'L'
		}

		while (true) {
			if (args.length == length[type]) {
				args.unshift(command)
				return data.push(args)
			}
			if (args.length < length[type]) throw new Error('malformed path data')
			data.push([command].concat(args.splice(0, length[type])))
		}
	})
	
	
	var pre	  ;
	for(var i=0;i<data.length;i++){
		if(data[i][0]=="l"||data[i][0]=="m"){
			data[i][1] =pre[1]+data[i][1];
			data[i][2] =pre[2]+data[i][2];
		}
		if(data[i].length==3){
			pre = data[i];
		}
	}
	return data
  }
  
  function ToolTip(game){
	Phaser.Group.call(this,game,null,"ToolTip",true);
	this._name = new Phaser.Text(game,0,0,"");
	this.add(this._name);
	game.input.addMoveCallback(function(pointer, x, y, isDown){
		this.x = x-30;
		this.y = y-30;
	}, this)
  }
  ToolTip.prototype = Object.create(Phaser.Group.prototype);
  ToolTip.prototype.constructor = ToolTip;
  ToolTip.prototype.setName = function(name){
	this._name.text = name;
  }
  
})();