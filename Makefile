include Makefile.helpers
modname = ehaugw-weapon-balancing
dependencies =

unity-from:
	cp /mnt/c/Users/eivind/MYHOME/Documents/SPTModding/SDK/EscapeFromTarkov-SDK/AssetBundles/StandaloneWindows/scar_h_gen_3_upper.bundle bundles/SCAR_H_GEN_3/

unity-to:
	cp -r /mnt/c/Users/eivind/MYHOME/Documents/SPTModding/Mk17Gen3/Textures/* /mnt/c/Users/eivind/MYHOME/Documents/SPTModding/SDK/EscapeFromTarkov-SDK/Assets/Ehaugw/Attachments/Mk17Gen3/Rail/Textures/

assemble: unity-from
	rm -f -r export
	mkdir -p export/$(tspath)/$(modname)
	mkdir -p export/$(tspath)/$(modname)/src
	cp -r bundles export/$(tspath)/$(modname)/bundles
	cp src/mod.ts export/$(tspath)/$(modname)/src
	cp package.json export/$(tspath)/$(modname)/
	cp bundles.json export/$(tspath)/$(modname)/
	cp README.md export/$(tspath)/$(modname)/
	cp icon.png export/$(tspath)/$(modname)/

forceinstall:
	make assemble
	rm -r -f $(gamepath)/$(pluginpath)/$(modname)
	cp -u -r export/* $(gamepath)

play:
	(make install && cd .. && make play)
