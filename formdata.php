<?php
	// Show all errors
	error_reporting(E_ALL); //error_reporting(E_ALL ^ E_NOTICE);
		
	class FormData extends ArrayObject 
	{
		private $clean_get;
		private $clean_post;

	    public function __construct($dirty_get, $dirty_post) 
		{
        	$this->clean_get = $this->clean($dirty_get);
			$this->clean_post = $this->clean($dirty_post);
		}
		
		public function __destruct()
		{
			unset($this->clean_get);
			unset($this->clean_post);
		}
		
		private function clean($elem) 
		{ 
			if(!is_array($elem)) 
				$elem = htmlentities($elem,ENT_QUOTES,"UTF-8"); 
			else 
				foreach ($elem as $key => $value) 
					$elem[$key] = $this->clean($value); 
			return $elem; 
		}
		
		public function get($key)
		{
			if( !empty($this->clean_get[$key]) and strlen($this->clean_get[$key]) > 0)
				return trim($this->clean_get[$key]);

			return NULL;
		}
		
		public function hasGet()
		{
			return !empty($this->clean_get) and count($this->clean_get) > 0;
		}
		
		public function post($key)
		{			
			if( !empty($this->clean_post[$key]) and strlen($this->clean_post[$key]) > 0)
				return trim($this->clean_post[$key]);

			return NULL;
		}
		
		/**
		Returns true if the page has post data, false otherwise
		*/
		public function hasPost()
		{
			return !empty($this->clean_post) and count($this->clean_post) > 0;
		}
		
		/**
		Returns true if the page has either POST or GET data, use value(...) to retrieve available
		data from either submit formats
		*/
		public function hasValues()
		{
			return ( $this->hasGet() or $this->hasPost());
		}
		
		/**
		Returns either the POST or GET values if found. POST data has precedence over GET data
		in the case of duplicated keys
		*/
		public function value($key)
		{			
			if( !empty($this->clean_post[$key]) and strlen($this->clean_post[$key]) > 0)
				return trim($this->clean_post[$key]);
				
			if( !empty($this->clean_get[$key]) and strlen($this->clean_get[$key]) > 0)
				return trim($this->clean_get[$key]);

			return NULL;
		}
		
		// START ArrayObject Interface Implementation 
		public function offsetGet($name)
		{
        	return $this->value($name);
		}
		public function offsetSet($name, $value)
		{
			$this->clean_get[$name] = $value;
			$this->clean_post[$name] = $value;
		}
		public function offsetExists($name)
		{
			return isset($this->value[$name]); 
		}
		public function offsetUnset($name)
		{ 
			unset($this->clean_get[$name]);
			unset($this->clean_post[$name]);
		}
		// END ArrayObject Interface Implementation 
	}
	
	// Create the form data parsing from either GET or POST
	global $form;
	$form = new FormData($_GET, $_POST);
?>