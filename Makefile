-include .env

BASEDIR									= $(realpath .)

SRCDIR									= $(BASEDIR)/src
DISTDIR									= $(BASEDIR)/dist
DOCSDIR									= $(BASEDIR)/docs

PROJECT									= frappe-charts

NODEMOD									= $(BASEDIR)/node_modules
NODEBIN									= $(NODEMOD)/.bin

build: clean install
	$(NODEBIN)/rollup						    \
		--config $(BASEDIR)/rollup.config.js	\
		--watch=$(watch)

clean:
	rm -rf 										\
		$(BASEDIR)/.nyc_output					\
		$(BASEDIR)/.yarn-error.log

	clear

install.dep:
ifeq ($(shell command -v yarn),)
	@echo "Installing yarn..."
	npm install -g yarn
endif

install: install.dep
	yarn --cwd $(BASEDIR)

test: clean
	$(NODEBIN)/cross-env							\
		NODE_ENV=test								\
	$(NODEBIN)/nyc									\
	$(NODEBIN)/mocha								\
		--require $(NODEMOD)/babel-register			\
		--recursive									\
		$(SRCDIR)/js/**/test/*.test.js

coveralls:
	$(NODEBIN)/nyc report --reporter text-lcov | $(NODEBIN)/coveralls
