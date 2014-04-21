<?php

/*
 *	Include JavaScript WordPress editor functions
 */
if( file_exists( get_template_directory() . '/inc/js-wp-editor.php' ) ) {
	require_once( get_template_directory() . '/inc/js-wp-editor.php' );

	js_wp_editor();
}