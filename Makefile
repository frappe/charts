-include .env

BASEDIR									= $(realpath .)

SRCDIR									= $(BASEDIR)/src
TESTDIR									= $(SRCDIR)/test

NODEMOD									= $(BASEDIR)/node_modules
NODEBIN									= $(NODEMOD)/.bin

build:
	$(NODEBIN)/rollup						    \
		--config $(BASEDIR)/rollup.config.js

test:
	NODE_ENV=test								\
	$(NODEBIN)/mocha							\
		--recursive								\
		--require $(NODEMOD)/babel-register		\
		$(TESTDIR)
