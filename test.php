<?php defined('BASEPATH') OR exit('No direct script access allowed');
class Flightsearch extends CI_Controller {
        public function __construct(){
                parent::__construct();
                date_default_timezone_set('America/New_York');
                $this->load->model('common_model');
                $this->load->library('session');
                $this->load->library('encrypt');
        }
public function GetToken(){
//echo "token";
$_dsAppKey = base64_encode(base64_encode('V1:516047:5OLI:AA').':'.base64_encode('A1B2C3D4'));
//$_dsAppKey = base64_encode(base64_encode('V1:516047:5OLI:AA').':'.base64_encode('WS241218'));

$_url = 'https://api.havail.sabre.com/';
$FPATH= ROOTPATH.'cache/token/';
$myFile=$FPATH."token.json";
if (file_exists($myFile)) {
//$fh = fopen($myFile, 'w') or die('no fopen');
  $strJsonFileContents = file_get_contents($myFile);
  $js = json_decode($strJsonFileContents,true);
  if(($js['start_time']+500000) < time()){
        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_URL, $_url . 'v2/auth/token');
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/x-www-form-urlencoded;charset=UTF-8','Authorization:Basic ' . $_dsAppKey));
                    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $ret = curl_exec($ch);
                        //curl_close($ch);
                        $js = json_decode($ret,true);
         $js['start_time']=time();
                 $retVal = json_encode($js,true);
                        $fh = fopen($myFile, 'w') or die('no create file');
        fwrite($fh, $retVal);
fclose($fh);
  }
} else {
$ch = curl_init();
                        curl_setopt($ch, CURLOPT_URL, $_url . 'v2/auth/token');
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-type: application/x-www-form-urlencoded;charset=UTF-8','Authorization:Basic ' . $_dsAppKey));
                    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        $ret = curl_exec($ch);
                        //curl_close($ch);
                        $js = json_decode($ret,true);
         $js['start_time']=time();
                 $retVal = json_encode($js,true);
                        $fh = fopen($myFile, 'w') or die('no create file');
        fwrite($fh, $retVal);
fclose($fh);

}
//echo print_r(str_replace('\/', '/', $js['access_token']));
//echo 'test'; die();
            return $js['access_token'];
//              return 'T1RLAQLOkXcEv17QtMxjbzDx6b369wAuc0JBPyTw0MVa7jn/CRC9vBf4h5HujAX+4agn6BPMAADQuqkyk8eBatC419f4IXgc9sMilpcEKOMMbUZtdg1dEetGFt/EjQEvnrHADkE3uoMVzVHuxzwE3b0yiN5I9+hWbVnWbvT1YbR7HaOIWesOI3JBg5UFxZ8vLmvWNjX25IeaZItGXo2ckGZqUmdCZ6XAt4jx7nM+4Dp5wo2f5VdortXgrYzptwDCrsSfwqAY2RF6kKlimio7eaHhgPFL4b7g9ZMquWUdQqbzU/0+2+oRxopfvZAMnIT69OwGeZUNtNAfrziDB8C7QrsemDZk81CzCw**';
        }
        public function index(){
            //echo $_SERVER['REQUEST_URI'];die;
        $this->load->view('noallowresults');
        }
public function search(){
if(!empty($_REQUEST['From']) && !empty($_REQUEST['To']) && !empty($_REQUEST['DepDate'])){
                        $this->common_model->getOrigin($_REQUEST['From'],$_REQUEST['To']);
                $origin1 = $_REQUEST['From'];
                $destination1 = $_REQUEST['To'];
                $departure_date1 = $_REQUEST['DepDate'];
                        $origin2 = $_REQUEST['From2'];
                $destination2 = $_REQUEST['To2'];
                $departure_date2 = $_REQUEST['DepDate2'];
                        $origin3 = $_REQUEST['From3'];
                $destination3 = $_REQUEST['To3'];
                $departure_date3 = $_REQUEST['DepDate3'];
                $origin4 = $_REQUEST['From4'];
                $destination4 = $_REQUEST['To4'];
                $departure_date4 = $_REQUEST['DepDate4'];
                $return_date = $_REQUEST['RetDate'];
//$adults = $_REQUEST['Adults']+$_REQUEST['Senior'];
                $adults = $_REQUEST['Adults'];
               $senior = $_REQUEST['Senior'];
                $children = $_REQUEST['Children'];
                $infants =$_REQUEST['Infants'];
                $infantos =$_REQUEST['Infantos'];
                $travel_class = $_REQUEST['pref_cabin'];
                $TripType = $_REQUEST['Triptype'];
                $direct = $_REQUEST['Direct'];
                $check_exclude1=$this->common_model->check_exclude_airline($origin1,$destination1);
                if(!empty($check_exclude1)){
                $exclude_airline=       $check_exclude1->airline_code;
                } else {
                $check_exclude2=$this->common_model->check_exclude_airline2($origin1,$destination1);
        if(!empty($check_exclude2)){
                $exclude_airline=$check_exclude2->airline_code;
                } else {
       $exclude_airline='';
                }
                }
if(isset($_REQUEST['Pg'])){
$this->session->set_userdata('reference_page',$_REQUEST['Pg']);
}
if($_REQUEST['Pg']=='LON'){
$data['mobile_no']='1-201-535-8633';
} else if($_REQUEST['Pg']=='EUR'){
$data['mobile_no']='1-201-535-8604';
} else if($_REQUEST['Pg']=='STD'){
$data['mobile_no']='1-201-535-8592';
} else if($_REQUEST['Pg']=='CIF'){
$data['mobile_no']='1-201-377-0091';
} else if($_REQUEST['Pg']=='DL' || $_REQUEST['Pg']=='AA'){
$data['mobile_no']='1-201-535-8598';
} else if($_REQUEST['Pg']=='CFT'){
$data['mobile_no']='1-201-377-0091';
} else if($_REQUEST['pref_cabin']=='C' && $_REQUEST['CS']=='C'){
$data['mobile_no']='1-201-377-0040';
} else {
$data['mobile_no']='416-291-2025';
}
$this->session->set_userdata('mobile_no',$data['mobile_no']);
                if(!empty($_REQUEST['Include'])){
                $include_airline=$_REQUEST['Include'];
                } else {
                $include_airline='';
                }
                //echo $exclude_airline;die;
                $seat_requested=$adults+$children+$senior;
                if($_REQUEST['CR']!=''){
$currency_code=$_REQUEST['CR'];
$currency_rate=$this->get_currency_rate_by_currency($_REQUEST['CR']);
$data['currency_rate']=$currency_rate;
                } else {
                $currency_code='CAD';
                $data['currency_rate']=1;
                }
                $data['currency_code']=$currency_code;
                //$data['coupon_code']=$this->common_model->get_coupon_cd();
                $data['currency_symbol']=$this->common_model->getCurrency_symbol($currency_code);
        $data['currency_data']=$currency_code.' '.$data['currency_symbol'];

                //print_r($_REQUEST);die;
$itins='50ITINS';
                $url="https://api.havail.sabre.com/v4.2.0/shop/flights?mode=live&limit=10&enabletagging=true";
                if($TripType=='OneWay'){
                        $return_date='';
                        }
if(!isset($_REQUEST['Target'])){
                $data['FlightResult']=$this->Request($url,$departure_date1,$return_date,$origin1,$destination1,$travel_class,$TripType,$seat_requested,$adults,$children,$infants,$departure_date2,$origin2,$destination2,$departure_date3,$origin3,$destination3,$departure_date4,$origin4,$destination4,$exclude_airline,$include_airline,$currency_code,$itins,$infantos,$senior,$direct);
        // print_r($data['FlightResult']);die;  //echo 'test'; print_r($data);die;
                //print_r($_REQUEST); die;
if($include_airline!='' && empty($data['FlightResult']->OTA_AirLowFareSearchRS->PricedItineraries->PricedItinerary)){
$domain_new="https://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
$domain_new = str_replace('Include=', '',  $domain_new);
redirect($domain_new);
}
if($travel_class=='W' && empty($data['FlightResult']->OTA_AirLowFareSearchRS->PricedItineraries->PricedItinerary)){
$domain_new="https://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
$domain_new = str_replace('pref_cabin=W', 'pref_cabin=Y',  $domain_new);
$this->session->set_flashdata('msg77', 'This is my message');