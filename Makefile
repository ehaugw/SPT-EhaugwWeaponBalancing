include Makefile.helpers
include Makefile.secret
modname = ehaugw-weapon-balancing
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
	scp -r export/* $(hostwanuser):SPT_3_11/server_files

compileandexecute: forceinstall

play:
	(make install && cd .. && make play)
