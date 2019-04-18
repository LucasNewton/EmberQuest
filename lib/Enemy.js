var Enemy = function(x,y,asset){
	var enemy = {};
	enemy.character;
	enemy.spd;
	enemy.jump;
	enemy.jumpReset;
	enemy.airTime;
	enemy.peakTime;
	enemy.airDrag;
	enemy.useJumpingMechanic;
	enemy.lastDisplaceX;
	enemy.lastDisplaceY;
	enemy.asset;
	enemy.originX;
	enemy.originY;
	enemy.sightX;
	enemy.invulnerableTime;
	enemy.maxInvulnerability;
	enemy.health;
	enemy.maxHealth;
	enemy.friendly;
	enemy.attack;
	enemy.damage;
	enemy.pierce;

	enemy.enemyJumps;

	enemy.particleController;

	enemy.initialize = function(){
		enemy.asset = asset;
		enemy.originX = x;
		enemy.originY = y;
		enemy.spd = 6;
		enemy.jump = 0;
		enemy.jumpReset = 0;
		enemy.airTime = 0;
		enemy.peakTime = 25;
		enemy.airDrag = 20;
		enemy.useJumpingMechanic = true;
		enemy.lastDisplaceX = 0;
		enemy.lastDisplaceY = 0;
		enemy.sightX = 240;
		enemy.invulnerableTime = 0;
		enemy.maxInvulnerability = 30;
		enemy.maxHealth = 3;
		enemy.health = enemy.maxHealth;
		enemy.friendly = false;
		enemy.attack = true;
		enemy.damage = 5;
		enemy.pierce = true;

		enemy.enemyJumps = false;
	}();

	enemy.update = function(){

		var displaceX;
		if(enemy.character.graphic.x < playerArray[0].character.graphic.x && playerArray[0].character.graphic.x - enemy.character.graphic.x <= enemy.sightX) //enemy doesn't follow the player unless they're in range
		{
			displaceX = 0.5;
		}
		else if(enemy.character.graphic.x > playerArray[0].character.graphic.x && enemy.character.graphic.x - playerArray[0].character.graphic.x <= enemy.sightX)
		{
			displaceX = -0.5;
		}
		else
		{
			displaceX = 0;
		}

		//stun if damaged.
		if(enemy.invulnerableTime > 0){
			displaceX = 0;
		}

		var displaceY = 0; //= (DOWN-UP);

		if(enemy.character.hitsWallX(displaceX*enemy.spd))
		{
			enemy.enemyJumps = true;
		}

		if(!enemy.useJumpingMechanic){
			if(displaceX != 0){
				enemy.character.moveX(displaceX*enemy.spd);
			}
			if(displaceY != 0){

				enemy.character.moveY(displaceY*enemy.spd);
			}

		}else{
			if(displaceX != 0){


				//update the flame sprite if we're moving in a direction
				if(enemy.lastDisplaceX != displaceX){
					//console.log("SPRITE UPDATE!");
					var dir;
					if(displaceX < 0){
						dir = -1;
					}else{
						dir = 1;
					}

					blueFlameMovingAsset.scaleX = blueFlameMovingAsset.defaultScaleX*dir;
					enemy.character.setSprite(blueFlameMovingAsset);
				}

				enemy.character.moveX(displaceX*enemy.spd);

			}else if(enemy.character.asset != blueFlameStillAsset){
				//if we're still, and we haven't updated to the still image, be still!!
				enemy.character.setSprite(blueFlameStillAsset);
			}

			//check for enemy jumping or falling
			if(enemy.enemyJumps && !enemy.jump && enemy.character.hitsWallY(1)){
				enemy.jump = 1;
				enemy.airTime = -enemy.peakTime;
			}else if(!enemy.jump && !enemy.character.hitsWallY(1)){
				enemy.jump = 1;
				enemy.airTime = 0;
			}

			if(!enemy.character.hitsWallX(displaceX*enemy.spd) && enemy.jump && enemy.airTime < 0){
				enemy.airTime = 0;
			}

			//if we're jumping or falling
			if(enemy.jump){
				enemy.airTime++;
				var dir = 1;
				if(enemy.airTime < 0){
					dir = -1;
				}
				
				//terminal velocity
				if(enemy.airTime > enemy.peakTime){
					enemy.airTime = enemy.peakTime;
				}

				//move the enemy, also check if we hit the ground.
				if(!enemy.character.moveY(enemy.airTime*enemy.airTime*dir/enemy.airDrag)){
					enemy.jump = 0;
					enemy.airTime = 0;
					//console.log(orvelObject.graphic.y);
				}
			}

			enemy.enemyJumps = false;
		}


		//remember last input
		enemy.lastDisplaceX = displaceX;
		enemy.lastDisplaceY = displaceY;

		//update particleController
		enemy.particleController.update();

		//have we taken damage?
		enemy.checkIfDamaged();
	}

	enemy.checkIfDamaged = function(){
		if(enemy.invulnerableTime == 0){
			var c = 0;
			var highestDamage = 0;
			var attackInQuestion = null;
			//go through every generated object and find the most damaging thing that is colliding with us. Take that damage, and if that entity can be destroyed when it attacks, destroy it. Also gain i frames.
			while(c < generatedObjectsArray.length){
				//is the object an attack?
				if(generatedObjectsArray[c].attack != undefined && generatedObjectsArray[c].attack){
					//is this entity of the opposite nature? (i.e. if we are not friendly, and it is, then we take damage)
					if(generatedObjectsArray[c].friendly != undefined && generatedObjectsArray[c].friendly != enemy.friendly){
						//does the object have collision, and if so, are we colliding?
						if(generatedObjectsArray[c].character != undefined && generatedObjectsArray[c].character.graphic != undefined && enemy.character.hitTestRectangle(enemy.character, generatedObjectsArray[c].character)){
							//is the damage not null and greater than 0/our last highest damage?
							if(generatedObjectsArray[c].damage != undefined && generatedObjectsArray[c].damage > highestDamage){
								highestDamage = generatedObjectsArray[c].damage;
								attackInQuestion = generatedObjectsArray[c];
							}
						}
					}
				}
				c++;
			}
			if(attackInQuestion != null){
				enemy.invulnerableTime = enemy.maxInvulnerability;
				enemy.changeHealth(-1*highestDamage);
				if(attackInQuestion.pierce != undefined && attackInQuestion.pierce == false){
					attackInQuestion.unload();
				}
				attackInQuestion = null;
			}
		}else{
			enemy.invulnerableTime--;
			if(enemy.invulnerableTime > 0){
				if(enemy.invulnerableTime % 3 == 0 || enemy.invulnerableTime % 4 == 0){
					enemy.character.graphic.alpha = .25;
				}else{
					enemy.character.graphic.alpha = 1;
				}
			}
		}
	}

	enemy.changeHealth = function(offset){
		enemy.health += offset;

		if(enemy.health > enemy.maxHealth){
			enemy.health = enemy.maxHealth;
		}else if(enemy.health <= 0){
			enemy.health = 0;
			Cinder(enemy.character.graphic.x,enemy.character.graphic.y);
			Cinder(enemy.character.graphic.x,enemy.character.graphic.y);
			Cinder(enemy.character.graphic.x,enemy.character.graphic.y);
			//die if we lose all health
			enemy.unload();
		}
	}

	enemy.load = function(){
		enemy.character = Character(enemy.originX,enemy.originY,enemy.asset);
		enemyArray.push(enemy);
		enemy.particleController = ParticleController(enemy.character.graphic.x,enemy.character.graphic.y,enemy);
	}

	enemy.unload = function(){

		enemy.character.graphic.destroy();
		for(var i = 0; i < enemyArray.length; i++){
			if(enemyArray[i] == enemy){
				enemy.particleController.free();
				enemyArray.splice(i,1);
			}
		}
	}

	enemy.scroll = function(){
		if(scrollXOffset != 0){
			enemy.character.mX(scrollXOffset);
		}
		if(scrollYOffset != 0){
			enemy.character.mY(scrollYOffset);
		}
		
		enemy.particleController.scroll();
		
	}

	enemy.depth = function(){
		enemy.particleController.depth();

		app.stage.setChildIndex(enemy.character.graphic,childNum);
		childNum++;
	}

	return enemy;
}