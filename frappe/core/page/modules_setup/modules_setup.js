frappe.pages['modules_setup'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Show or Hide Desktop Icons'),
		single_column: true
	});
	frappe.modules_setup_page = page;

	page.content = $(frappe.templates.modules_setup).appendTo(page.body);

	page.content.find('select[name="setup_for"]').on('change', function() {
		page.content.find('select[name="user"]').toggle($(this).val() !== "everyone");
		frappe.reload_modules_setup_icons(page);
	});

	page.content.find('select[name="user"]').on('change', function() {
		frappe.reload_modules_setup_icons(page);
	});

	// return selected user or null (if everyone)
	page.get_user = function() {
		var selected_user = null;
		if(page.content.find('select[name="setup_for"]').length) {
			if(page.content.find('select[name="setup_for"]').val()==="everyone") {
				selected_user = null;
			} else {
				selected_user = page.content.find('select[name="user"]').val();
			}
		} else {
			selected_user = frappe.boot.user.name;
		}
		return selected_user;
	}

	// save action
	page.set_primary_action('Save', function() {
		var hidden_list = [];
		page.content.find('input[type="checkbox"]').each(function() {
			if(!$(this).is(':checked')) {
				hidden_list.push($(this).attr('data-module'));
			}
		});

		frappe.call({
			method: 'frappe.core.page.modules_setup.modules_setup.update',
			args: {
				hidden_list: hidden_list,
				user: page.get_user()
			},
			freeze: true
		});
	});

	// application installer
	if(frappe.boot.user.roles.indexOf('System Manager')!==-1) {
		page.add_inner_button('Install Apps', function() {
			frappe.set_route('applications');
		});
	}
}

frappe.pages['modules_setup'].on_page_show = function(wrapper) {
	if(frappe.route_options) {
		frappe.modules_setup_page.content.find('select[name="setup_for"]')
			.val('user').trigger('change');
		frappe.modules_setup_page.content.find('select[name="user"]')
			.val(frappe.route_options.user).trigger('change');

		frappe.route_options = null;
	}
}

// reload modules html (with new hidden / blocked settings for given user)
frappe.reload_modules_setup_icons = function(page) {
	frappe.call({
		method: 'frappe.core.page.modules_setup.modules_setup.get_module_icons_html',
		args: {
			user: page.get_user()
		},
		freeze: true,
		callback: function(r) {
			page.content.find('.modules-setup-icons').replaceWith(r.message);
		}
	});
}
