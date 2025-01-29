include Makefile.helpers
modname = EhaugwWeaponBalancing
dependencies =

assemble:
	rm -f -r export
	mkdir -p export/$(tspath)/$(modname)
	mkdir -p export/$(tspath)/$(modname)/src
	cp src/mod.ts export/$(tspath)/$(modname)/src
	cp package.json export/$(tspath)/$(modname)/
	cp README.md export/$(tspath)/$(modname)/
	cp icon.png export/$(tspath)/$(modname)/

forceinstall:
	make assemble
	rm -r -f $(gamepath)/$(pluginpath)/$(modname)
	cp -u -r export/* $(gamepath)

play:
	(make install && cd .. && make play)
