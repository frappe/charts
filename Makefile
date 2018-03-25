-include .env

BASEDIR									= $(realpath .)

SRCDIR									= $(BASEDIR)/src
TESTDIR									= $(SRCDIR)/test

NODEMOD									= $(BASEDIR)/node_modules
NODEBIN									= $(NODEMOD)/.bin

build:
	$(NODEBIN)/rollup						    \
		--config $(BASEDIR)/rollup.config.js

install.dep:
ifeq ($(shell command -v yarn),)
	@echo "Installing yarn..."

	$(eval npm  := $(shell command -v npm))
	$(npm) install -g yarn
endif

	$(eval yarn := $(shell command -v yarn))

install: install.dep
	$(yarn)										\
		--cwd $(BASEDIR)

test:
	NODE_ENV=test								\
	$(NODEBIN)/mocha							\
		--recursive								\
		--require $(NODEMOD)/babel-register		\
		$(TESTDIR)
