var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;

	self.actions();
}

instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'hass ip : http://x.x.x.x<br>PORT : [8123]'
		},
		{
			type: 'textinput',
			id: 'prefix',
			label: 'HASS IP',
			width: 12
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'port',
			width: 12
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

instance.prototype.actions = function(system) {
	var self = this;
	var urlLabel = 'URL';

	if ( self.config.prefix !== undefined ) {
		if ( self.config.prefix.length > 0 ) {
			urlLabel = 'URI';
		}
	}

	self.setActions({
		'webhook': {
			label: 'webhook ID',
			options: [
				{
					type: 'textinput',
					label: urlLabel,
					id: 'url',
					default: ''
				}
			]
		},
	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	if ( self.config.prefix !== undefined && action.options.url.substring(0,4) != 'http' ) {
		if ( self.config.prefix.length > 0 ) {
			cmd = self.config.prefix + ':' + self.config.port + '/api/webhook/' + action.options.url;
		}
		else {
			cmd = action.options.url;
		}
	}
	else {
		cmd = action.options.url;
	}

	if (action.action == 'webhook') {
		var body;
		try {
			body = {};
		} catch(e){
			self.log('error', 'HTTP POST Request aborted: Malformed JSON Body (' + e.message+ ')');
			self.status(self.STATUS_ERROR, e.message);
			return
		}
		self.system.emit('rest', cmd, body, function (err, result) {
			if (err !== null) {
				self.log('error', 'HTTP POST Request failed (' + result.error.code + ')');
				self.status(self.STATUS_ERROR, result.error.code);
			}
			else {
				self.status(self.STATUS_OK);
			}
		});
	}
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
