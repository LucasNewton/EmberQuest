function GenericNPC (x, y, asset) {
	var genericNPC = {};
	genericNPC.originX;
	genericNPC.originY;
	genericNPC.asset;
	genericNPC.npc;
	genericNPC.time;
	genericNPC.spawnTime;
	genericNPC.loaded;

	genericNPC.initialize = function () {
		genericNPC.originX = x;
		genericNPC.originY = y;
		genericNPC.asset = asset;
		genericNPC.time = 0;
		genericNPC.spawnTime = randomInt(100, 300);
		genericNPC.loaded = false;
	}();

	genericNPC.update = function () {
		if (genericNPC.loaded) {
			genericNPC.time++;
			if (genericNPC.time == genericNPC.spawnTime) {
				genericNPC.time = 0;
				genericNPC.spawnTime = randomInt(100, 300);
				var textFile;
				if (currentArea.name == "DebugArea") {
					textFile = "dialog/genericNPC1.txt";
				} else if (currentArea.name == "DebugArea2") {
					textFile = "dialog/genericNPC2.txt";
				}
				genericNPC.npc = NPC(genericNPC.originX, genericNPC.originY, genericNPC.asset, textFile);
				//genericNPC.moveDir;
				genericNPC.npc.load();
			}
		}
	}

	genericNPC.load = function () {
		genericNPC.loaded = true;
	}
	genericNPC.unload = function () {
		genericNPC.loaded = false;
	}
	return genericNPC;
}