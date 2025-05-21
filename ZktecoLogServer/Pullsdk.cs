using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Diagnostics;
using Microsoft.CSharp;
using System.CodeDom.Compiler;
using System.Globalization;
using System.Text.Json;

namespace ZKT
{
    public partial class Pullsdk
    {
        public IntPtr h = IntPtr.Zero;
        public string test = "test";

        //4.1  call connect function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "Connect")]
        public static extern IntPtr Connect(string Parameters);

        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "PullLastError")]
        public static extern int PullLastError();

        //4.2 call Disconnect function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "Disconnect")]
        public static extern void Disconnect(IntPtr h);

        //4.3 call SetDeviceParam function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "SetDeviceParam")]
        public static extern int SetDeviceParam(IntPtr h, string itemvalues);

        //4.4 call GetDeviceParam function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "GetDeviceParam")]
        public static extern int GetDeviceParam(IntPtr h, ref byte buffer, int buffersize, string itemvalues);

        //4.5 call ControlDevice function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "ControlDevice")]
        public static extern int ControlDevice(IntPtr h, int operationid, int param1, int param2, int param3, int param4, string options);

        //4.6 call SetDeviceData function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "SetDeviceData")]
        public static extern int SetDeviceData(IntPtr h, string tablename, string data, string options);

        //4.7 call GetDeviceData function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "GetDeviceData")]
        public static extern int GetDeviceData(IntPtr h, ref byte buffer, int buffersize, string tablename, string filename, string filter, string options);

        //4.8 call GetDeviceDataCount function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "GetDeviceDataCount")]
        public static extern int GetDeviceDataCount(IntPtr h, string tablename, string filter, string options);

        //4.9 call DeleteDeviceData function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "DeleteDeviceData")]
        public static extern int DeleteDeviceData(IntPtr h, string tablename, string data, string options);

        //4.10 call GetRTLog function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "GetRTLog")]
        public static extern int GetRTLog(IntPtr h, ref byte buffer, int buffersize);

        //4.11 call SearchDevice function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "SearchDevice")]
        //public static extern int SearchDevice( ref byte commtype, ref byte address, ref byte buffer);
        public static extern int SearchDevice(string commtype, string address, ref byte buffer);

        //4.12 call ModifyIPAddress function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "ModifyIPAddress")]
        public static extern int ModifyIPAddress(string commtype, string address, string buffer);

        //4.14 call SetDeviceFileData function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "SetDeviceFileData")]
        public static extern int SetDeviceFileData(IntPtr h, string filename, ref byte buffer, int buffersize, string options);

        //4.15 cal GetDeviceFileData function
        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "GetDeviceFileData")]
        public static extern int GetDeviceFileData(IntPtr h, ref byte buffer, ref int buffersize, string filename, string options);

        [DllImport("C:\\Windows\\SysWOW64\\plcommpro.dll", EntryPoint = "ProcessBackupData")]
        public static extern int ProcessBackupData(byte[] data, int fileLen, ref byte Buffer, int BufferSize);

        public Pullsdk()
        {

        }

        public int setParam(string param, string value)
        {
            int ret = 0;
            int tt = 0;
            DateTime dt;
            if (param == "DateTime")    //Synchronization time
            {
                dt = DateTime.Now;
                tt = ((dt.Year - 2000) * 12 * 31 + (dt.Month - 1) * 31 + (dt.Day - 1)) * (24 * 60 * 60) + dt.Hour * 60 * 60 + dt.Minute * 60 + dt.Second;
                value = "" + tt;
            }
            ret = SetDeviceParam(h, param + '=' + value);

            return ret;
        }

        /* Read the total number of records in the device. Return specifies the number of records of the data.*/
        public string getDataCount(string devtablename, string devdatfilter, string options)
        {
            int ret;
            ret = GetDeviceDataCount(h, devtablename, devdatfilter, options);
            return "" + ret;
        }

        public string control(int operation)
        {
            int ret = 0;
            //ret= ControlDevice(h, 2, _door_no, 0, 0, 0, "");
            return "" + ret;
        }

        public string OpenDoor(int doorNumber, int openTimeSeconds = 5)
        {
            if (h == IntPtr.Zero)
            {
                return "Error: Device not connected.";
            }

            // operationid = 1 (output operation)
            // param1 = door number (e.g., 1, 2, 3, 4)
            // param2 = 1 (door output)
            // param3 = duration (in seconds)
            // param4 = 0 (reserved)
            // options = "" (empty)

            int result = ControlDevice(h, 1, doorNumber, 1, openTimeSeconds, 0, "");

            if (result >= 0)
            {
                return $"Door {doorNumber} opened successfully for {openTimeSeconds} seconds.";
            }
            else
            {
                int errorCode = PullLastError();
                return $"Failed to open door {doorNumber}. Error code: {errorCode}";
            }
        }


        public string ResetDoor(int doorNumber)
        {
            if (h == IntPtr.Zero)
            {
                return "Error: Device not connected.";
            }

            int result = ControlDevice(h, 4, doorNumber, 0, 0, 0, ""); // 4 = Disable Normally Open

            if (result >= 0)
            {
                return $"Door {doorNumber} reset successfully (disabled normally open).";
            }
            else
            {
                int errorCode = PullLastError();
                return $"Failed to reset door {doorNumber}. Error code: {errorCode}";
            }
        }


        public string getRTLog()
        {
            int BUFFERSIZE = 64 * 1024; // 64 KB buffer size
            byte[] buffer = new byte[BUFFERSIZE];
            int ret = GetRTLog(h, ref buffer[0], BUFFERSIZE);

            if (ret > 0)
            {
                return Encoding.Default.GetString(buffer);
            }
            else
            {
                int error = PullLastError();
                return $"Error: {error}";
            }
        }


        public string getData(string tablename, string fieldsnames, string filter, string param)
        {
            int ret = 0;
            //int BUFFERSIZE = 10 * 1024 * 1024;
            int BUFFERSIZE = 1 * 1024 * 1024;
            byte[] buffer = new byte[BUFFERSIZE];
            ret = GetDeviceData(h, ref buffer[0], BUFFERSIZE, tablename, fieldsnames, filter, param);
            if (ret >= 0)
            {
                string tmp = Encoding.Default.GetString(buffer);
                return tmp;
            }
            else
            {
                ret = PullLastError();
                return "" + ret;
            }
        }



        public string getParam(string str)
        {
            int ret = 0;
            int BUFFERSIZE = 10 * 1024 * 1024;
            byte[] buffer = new byte[BUFFERSIZE];
            string tmp = "";
            ret = GetDeviceParam(h, ref buffer[0], BUFFERSIZE, str);
            if (ret >= 0)
            {
                tmp = Encoding.Default.GetString(buffer);
                return tmp;
            }
            else
            {
                ret = PullLastError();
                return tmp;
            }
        }
    }
}
