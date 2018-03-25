-include .env

BASEDIR									= $(realpath .)

SRCDIR									= $(BASEDIR)/src
TESTDIR									= $(SRCDIR)/test

NODEMOD									= $(BASEDIR)/node_modules
NODEBIN									= $(NODEMOD)/.bin

test:
	$(NODEBIN)/mocha						\
		--recursive							\
		--compilers js:babel-core/register	\
		$(TESTDIR)
