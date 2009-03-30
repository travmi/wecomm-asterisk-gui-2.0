/*
 * Asterisk-GUI	- an Asterisk configuration interface
 *
 * Calling Rules functions
 *
 * Copyright (C) 2006-2008, Digium, Inc.
 *
 * Pari Nannapaneni <pari@digium.com>
 *
 * See http://www.asterisk.org for more information about
 * the Asterisk project. Please do not directly contact
 * any of the maintainers of this project for assistance;
 * the project provides a web site, mailing lists and IRC
 * channels for your use.
 *
 * This program is free software, distributed under the terms of
 * the GNU General Public License Version 2. See the LICENSE file
 * at the top of the source tree.
 *
 */
/*
sessionData.pbxinfo.callingRules : {
	CallingRule_US : [
				'_91NXXXXXXXXX,1,Macro( trunkdial-failover-0.1, ${trunk_1}/${EXTEN:1}, ${trunk_2}/${EXTEN:1} )'
			]
}
*/

var EDIT_CR ; //calling rule being edited
var EDIT_CR_RULE ;
var isNew;

var newCallingRule_form = function(){
	isNew = true ;
	EDIT_CR = '';
	EDIT_CR_RULE = '';

	_$('cr_dialog_title').innerHTML ='&nbsp;&nbsp;New CallingRule';
	ASTGUI.resetTheseFields ( [ DOM_new_crl_name, DOM_new_crl_pattern, DOM_new_crl_trunk, DOM_new_crl_tr_stripx, DOM_new_crl_tr_prepend, DOM_new_crl_foChkbx, DOM_new_crl_fotrunk, DOM_new_crl_fotr_stripx, DOM_new_crl_fotr_prepend , 'toLocalDest' , 'new_crl_localDest'] );
	_$('toLocalDest').updateStatus();
	$(DOM_new_CRL_DIV).showWithBg();
	ASTGUI.feedback({ msg:'New CallingRule !', showfor:1 });
};

var edit_CR_form = function(a,b){
	isNew = false;
	_$('cr_dialog_title').innerHTML ='&nbsp;&nbsp;Edit Calling Rule';

	EDIT_CR = a;
	EDIT_CR_RULE = b;
	var tmp_cr = ASTGUI.parseContextLine.obCallingRule(b) ;

	DOM_new_crl_name.value = EDIT_CR.withOut(ASTGUI.contexts.CallingRulePrefix) ;
	DOM_new_crl_name.disabled = true;
	DOM_new_crl_pattern.value = tmp_cr.pattern ;
	_$('new_crl_localDest').selectedIndex = -1;
	if( tmp_cr.destination ){
		ASTGUI.selectbox.selectOption('new_crl_localDest', tmp_cr.destination);
		_$('toLocalDest').checked = true;
	}else{
		_$('toLocalDest').checked = false;
		ASTGUI.selectbox.selectOption(DOM_new_crl_trunk, tmp_cr.firstTrunk );

		DOM_new_crl_tr_stripx.value = tmp_cr.stripdigits_firstTrunk  ;
		DOM_new_crl_tr_prepend.value = tmp_cr.firstPrepend ;
		if(tmp_cr.secondTrunk){
			DOM_new_crl_foChkbx.checked = true 
			ASTGUI.selectbox.selectOption(DOM_new_crl_fotrunk, tmp_cr.secondTrunk );
			DOM_new_crl_fotr_stripx.value = tmp_cr.stripdigits_secondTrunk ;
			DOM_new_crl_fotr_prepend.value = tmp_cr.secondPrepend ;
		} else {
			DOM_new_crl_foChkbx.checked = false;
		}
		en_db_fofields();
	}

	_$('toLocalDest').updateStatus();
	$(DOM_new_CRL_DIV).showWithBg();
	ASTGUI.feedback({ msg:'Edit CallingRule !', showfor:1 });
};


var en_db_fofields = function(){
	var t = !DOM_new_crl_foChkbx.checked;
	DOM_new_crl_fotrunk.disabled = t;
	DOM_new_crl_fotr_stripx.disabled = t;
	DOM_new_crl_fotr_prepend.disabled = t;
};


var load_DOMelements = function(){
	DOM_tbl_crls = _$('table_CRLS_list');
		// new calling rule dom elements
		DOM_new_cr_button = _$('new_cr_button');
		DOM_new_CRL_DIV = _$('new_CRL_DIV');
		DOM_new_crl_name = _$('new_crl_name');
		DOM_new_crl_pattern = _$('new_crl_pattern');
			DOM_new_crl_trunk = _$('new_crl_trunk');
			DOM_new_crl_tr_stripx = _$('new_crl_tr_stripx');
			DOM_new_crl_tr_prepend = _$('new_crl_tr_prepend');
		DOM_new_crl_foChkbx = _$('new_crl_foChkbx');
			DOM_new_crl_fotrunk = _$('new_crl_fotrunk');
			DOM_new_crl_fotr_stripx = _$('new_crl_fotr_stripx');
			DOM_new_crl_fotr_prepend = _$('new_crl_fotr_prepend');
		// new calling rule dom elements
	(function(){
		en_db_fofields();
		ASTGUI.events.add( DOM_new_crl_foChkbx, 'change' , en_db_fofields);
		ASTGUI.events.add( DOM_new_cr_button , 'click' ,  newCallingRule_form);

		var t = parent.astgui_managetrunks.listofAllTrunks();
		var TMP_FORSORT = [];
		t.each(function(item){
			TMP_FORSORT.push( parent.astgui_managetrunks.misc.getTrunkName(item) + ':::::::' +  item);
		});
		TMP_FORSORT.sort();
		TMP_FORSORT.each( function(this_str){
			var a = this_str.split(':::::::');
			ASTGUI.selectbox.append( DOM_new_crl_trunk, a[0], a[1] );
			ASTGUI.selectbox.append( DOM_new_crl_fotrunk , a[0], a[1] );
		});

		var modules_show = ASTGUI.cliCommand('module show');
		if( modules_show.contains('res_skypeforasterisk') && modules_show.contains('chan_skype') ){
			ASTGUI.selectbox.append( DOM_new_crl_trunk , 'Skype', 'Skype');
			ASTGUI.selectbox.append( DOM_new_crl_fotrunk , 'Skype', 'Skype');
		}
	})();
};

moveCrUpDown = function(context , rule , updown){
	ASTGUI.miscFunctions.moveUpDown_In_context( context , rule , updown , function(newcontext){
		parent.sessionData.pbxinfo.callingRules[context] = newcontext ;
		ASTGUI.feedback( { msg: 'Updated !', showfor: 2 , color: 'blue', bgcolor: '#FFFFFF' } );
		window.location.reload();
	});
};

var update_CRLSTable = function(){
	//DOM_tbl_crls
	var addCell = ASTGUI.domActions.tr_addCell; // temporarily store the function
	(function(){ // add first row
		var newRow = DOM_tbl_crls.insertRow(-1);
		newRow.className = "frow";
		addCell( newRow , { html:'', width: '100px' } );
		addCell( newRow , { html:'Calling Rule'} );
		addCell( newRow , { html:'Pattern'} );
		addCell( newRow , { html:'Trunk'} );
		addCell( newRow , { html:'Failover Trunk'} );
		addCell( newRow , { html:''} );
		//addCell( newRow , { html:'OutBound CID'} );
	})();

	var PreviousTRColor = 'odd' ; // 'odd' : 'even' ;

	(function (){
		var c = ASTGUI.cloneObject(parent.sessionData.pbxinfo.callingRules) ;
		for(var d in c){if(c.hasOwnProperty(d)){	
			var crd = c[d]; // temporarily store all the details of this calling  rule
			var tmp = '';
			PreviousTRColor = (PreviousTRColor == 'odd') ? 'even' : 'odd' ;

			var this_crl_set = ASTGUI.cloneObject(c[d]) ;
			var crl = d.withOut(ASTGUI.contexts.CallingRulePrefix);

			this_crl_set.each( function(this_rule, this_rule_index ){
				////////////////////////
					var tmp_movepriorities = '';
					if( this_rule_index == 0 ){
						tmp_movepriorities = '<img src=images/arrow_blank.png border=0>&nbsp;' ;
					}else{
						tmp_movepriorities = "<A href=# title='Move this rule Up'><img src=images/arrow_up.png border=0 onclick=\"moveCrUpDown('" + d + "','" + this_rule+ "', 1)\"></A>&nbsp; " ;
					}
						
					if( this_rule_index != ( this_crl_set.length -1 ) ){
						tmp_movepriorities += "<A href=# title='Move this rule Down'><img src=images/arrow_down.png border=0 onclick=\"moveCrUpDown('" + d + "','" + this_rule+ "', 0)\"></A>" ;
					}else{
						tmp_movepriorities += '<img src=images/arrow_blank.png border=0>' ;
					}
				//////////////////////

				var tmp_cr = ASTGUI.parseContextLine.obCallingRule(this_rule) ;
				var newRow = DOM_tbl_crls.insertRow(-1);
				newRow.className = PreviousTRColor ;

				addCell( newRow , { html: tmp_movepriorities } );
				addCell( newRow , { html: crl });
				addCell( newRow , { html: tmp_cr.pattern });

				if( tmp_cr.hasOwnProperty('firstTrunk') ){
					addCell( newRow , { html: tmp_cr.firstTrunk ? ( parent.astgui_managetrunks.misc.getTrunkName(tmp_cr.firstTrunk) || '<i><font color=red>Invalid Trunk</font></i>' ) : '<i><font color=red>None Assigned</font></i>' });
					addCell( newRow , { html: tmp_cr.secondTrunk ? ( parent.astgui_managetrunks.misc.getTrunkName(tmp_cr.secondTrunk) || '<i><font color=red>Invalid Trunk</font></i>' ): '<i>None Selected</i>' });
				}else{
					addCell( newRow , { html:  '<i><font color=blue>Local Destination : ' + ASTGUI.parseContextLine.showAs(tmp_cr.destination) + '</font></i>', align: 'left', colspan : 2 });
				}

				tmp = "<span class='guiButton' onclick=\"edit_CR_form('" + d +"','" + this_rule + "')\">Edit</span>" + 
					"<span class='guiButtonDelete' onclick=\"delete_CR_confirm('" + d +"','" + this_rule + "')\">Delete</span>" ;

				addCell( newRow , { html: tmp} );
			});
		}}

		if(DOM_tbl_crls.rows.length == 1){
			ASTGUI.domActions.clear_table(DOM_tbl_crls);
			var newRow = DOM_tbl_crls.insertRow(-1);
			newRow.className = 'even';
			addCell( newRow , { html:'No CallingRules defined !!'} );
			return ;
		}
	})();
};


var localajaxinit = function() {
	top.document.title = "Edit Calling Rules";

	var tmp_someArray = parent.miscFunctions.getAllDestinations() ;
	tmp_someArray.push({ optionText: 'Custom' , optionValue: 'CUSTOM' });
	ASTGUI.selectbox.populateArray( 'new_crl_localDest' , tmp_someArray);
	ASTGUI.domActions.showHideClassByCheckBox( 'toLocalDest', 'STT_TR_OPTIONS', true );
	load_DOMelements();
	update_CRLSTable();
	ASTGUI.events.add( 'restore_default_clrs_button', 'click' , restore_default_callingRules );

	$('#new_crl_localDest').change(function(){
		if( this.value == 'CUSTOM'){
			$('#new_crl_localDest_CUSTOM_container').show();
			$('#new_crl_localDest_CUSTOM').val('').focus();
		}else{
			$('#new_crl_localDest_CUSTOM_container').hide();
		}
	});
};


var restore_default_callingRules = function(){
	if( !confirm( 'This would restore the factory default Calling Rules.'
		+ '\n Any other custom calling rules will not be edited or deleted.'
		+ '\n Click OK to continue ' ) )return;
	

	var x = new listOfActions('extensions.conf');
	x.new_action('delcat', 'CallingRule_Longdistance', '', '');
	x.new_action('newcat', 'CallingRule_Longdistance', '', '');
	x.new_action('append', 'CallingRule_Longdistance', 'exten', '_91XXXXXXXXXX!,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:1}, , , )' );

	x.new_action('delcat', 'CallingRule_IAXTEL', '', '');
	x.new_action('newcat', 'CallingRule_IAXTEL', '', '');
	x.new_action('append', 'CallingRule_IAXTEL', 'exten', '_91700XXXXXXX!,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:1}, , , )' );
	
	x.new_action('delcat', 'CallingRule_Local_AreaCode', '', '');
	x.new_action('newcat', 'CallingRule_Local_AreaCode', '', '');
	x.new_action('append', 'CallingRule_Local_AreaCode', 'exten', '_9256XXXXXXX!,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:4}, , , )' );

	x.new_action('delcat', 'CallingRule_International', '', '');
	x.new_action('newcat', 'CallingRule_International', '', '');
	x.new_action('append', 'CallingRule_International', 'exten', '_9011XXXXX.,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:1}, , , )' );

	x.new_action('delcat', 'CallingRule_Local_7_digits', '', '');
	x.new_action('newcat', 'CallingRule_Local_7_digits', '', '');
	x.new_action('append', 'CallingRule_Local_7_digits', 'exten', '_9XXXXXXX!,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:1}, , , )' );

	x.new_action('delcat', 'CallingRule_Emergency', '', '');
	x.new_action('newcat', 'CallingRule_Emergency', '', '');
	x.new_action('append', 'CallingRule_Emergency', 'exten', '_911!,1,Macro(' + ASTGUI.contexts.dialtrunks + ',${}/${EXTEN:0}, , , )' );


	x.callActions(function(){
		ASTGUI.feedback( { msg : "Restored 'default Calling Rules' !", showfor: 3, color:'red' });
		alert( "Restored 'default Calling Rules' !" + '\n' + 'The gui will now reload' );
		top.window.location.reload();
	});
};


var new_crl_save_go = function(){
	if ( !ASTGUI.validateFields( [ DOM_new_crl_name, DOM_new_crl_pattern,  'new_crl_tr_stripx' , 'new_crl_tr_prepend' , 'new_crl_fotr_stripx' , 'new_crl_fotr_prepend' ] ) ){
		return ;
	}

	if( _$('toLocalDest').checked ){
		if ( !ASTGUI.checkRequiredFields([DOM_new_crl_name, DOM_new_crl_pattern]) ){
			return ;
		}
		if( !_$('new_crl_localDest').value  ){
			ASTGUI.feedback( { msg:'select a destination !', showfor:2, color:'red' });
			return ;
		}
	}else{
		if ( !ASTGUI.checkRequiredFields([DOM_new_crl_name, DOM_new_crl_pattern, DOM_new_crl_trunk ]) ){
			return ;
		}
	}

	if(_$('new_crl_foChkbx').checked){
		if ( !ASTGUI.checkRequiredFields([DOM_new_crl_fotrunk]) ){
			return ;
		}
	}

	if( _$('toLocalDest').checked ){
		var tmp_new_crl_localDest = ASTGUI.getFieldValue('new_crl_localDest') ;
		if( tmp_new_crl_localDest == 'CUSTOM' ){
			var as = DOM_new_crl_pattern.value + ',1,' + ASTGUI.getFieldValue('new_crl_localDest_CUSTOM') ; ////// <<<<<<<<<<<<<<<<<<<
		}else{
			var as = DOM_new_crl_pattern.value + ',1,' + tmp_new_crl_localDest ;
		}
	}else{
		var t1 = ASTGUI.getFieldValue(DOM_new_crl_trunk);
		var t2 = (DOM_new_crl_foChkbx.checked) ? ASTGUI.getFieldValue(DOM_new_crl_fotrunk) : '';
		if( _$('new_crl_foChkbx').checked && t1 == t2 ){
			ASTGUI.feedback( { msg:'Failover trunk can not be same as the primary trunk !', showfor: 3, color:'red' });
			DOM_new_crl_fotrunk.focus();
			return ;
		}

		var tmp_stripx = DOM_new_crl_tr_stripx.value || '0' ;
		var tmp_fotr_stripx = DOM_new_crl_fotr_stripx.value || '0' ;
		var tmp_checkThis = ( DOM_new_crl_pattern.value.beginsWith('_') ) ?  DOM_new_crl_pattern.value.length -1 :  DOM_new_crl_pattern.value.length ;

		if( Number(tmp_stripx) > tmp_checkThis ){
			ASTGUI.feedback( { msg:'You can not strip more digits than in the pattern !', showfor: 3, color:'red' });
			DOM_new_crl_tr_stripx.focus();
			return ;
		}

		if( DOM_new_crl_foChkbx.checked &&  Number(tmp_fotr_stripx) > tmp_checkThis ){
			ASTGUI.feedback( { msg:'You can not strip more digits than in the pattern !', showfor: 3, color:'red' });
			DOM_new_crl_fotr_stripx.focus();
			return ;
		}

		var t1_braces = (t1 == 'Skype') ? t1 : '${' + t1 + '}' ;
		var Trunk_Build_str = ',' + t1_braces + '/' + DOM_new_crl_tr_prepend.value + '${EXTEN:' + tmp_stripx  + '}' ;
		var foTrunk_Build_str = ',' ;

		if(DOM_new_crl_foChkbx.checked){
			var t2_braces = (t2 == 'Skype') ? t2 : '${' + t2 + '}' ;
			foTrunk_Build_str += t2_braces + '/' + DOM_new_crl_fotr_prepend.value + '${EXTEN:' + tmp_fotr_stripx + '}' ;
		}

		var t1_cidarg = ( t1 == 'Skype') ? ',' : ',' + t1 ;
		var t2_cidarg = ( t2 == 'Skype') ? ',' : ',' + t2 ;
		var as = DOM_new_crl_pattern.value + ',1,Macro(' + ASTGUI.contexts.dialtrunks + Trunk_Build_str + foTrunk_Build_str + t1_cidarg + t2_cidarg + ')' ;
	}

	if( isNew ){
		parent.astgui_manageCallingRules.createCallingRule( DOM_new_crl_name.value , as)
		ASTGUI.feedback( { msg:'CallingRule Created !', showfor:2, color:'green' });
		window.location.reload();
	}else{
		//parent.astgui_manageCallingRules.update( EDIT_CR, DOM_new_crl_name.value , cr_object ) ;
		parent.ASTGUI.dialog.waitWhile(' Updating ...');
 		parent.astgui_manageCallingRules.updateCallingRule( EDIT_CR, EDIT_CR_RULE, as )
		ASTGUI.feedback( { msg:'Calling Rule Updated !', showfor:2, color:'green' });
		parent.ASTGUI.dialog.hide();
		window.location.reload();
	}
};

var delete_CR_confirm = function(a,b){
	if( !confirm('Delete Calling Rule ?') ) return;
	parent.astgui_manageCallingRules.deleteCallingRule(a,b);
	ASTGUI.feedback( { msg:'Calling Rule Deleted !', showfor:2, color:'red' });
	window.location.reload();
};
